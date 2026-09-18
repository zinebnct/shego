/**
 * Notifications — Technical Blueprint V1.3 §15, §21, §37 : registerPushToken, listNotifications, markRead.
 * Expo Push Notification Service. SEULES les notifications transactionnelles des specs existent (8 types,
 * `NotificationPayload`) — aucune notification marketing ni de réengagement en V1 (Blueprint produit §14).
 * Le push ne contient jamais l'adresse exacte : il renvoie vers l'app, qui lit le détail sous RLS.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { isNotificationPayload, type NotificationPayload } from '@/types/notifications';
import { appError } from '@/types/errors';
import { fail, ok, type Result } from '@/types/result';
import { fromSupabase, toAppError } from './_internal';
import { updateProfile } from './profile.service';

const ANDROID_CHANNEL_ID = 'default';

/** Comportement en premier plan : bannière + liste, sans son ni badge (registre calme du produit). */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'SHEGO',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Enregistre le jeton Expo Push de l'appareil dans `users.push_token` (colonne citée en Blueprint §15) si la permission
 * est accordée. La demande de permission elle-même vit dans `useNotificationPermission` (jamais en groupe).
 * Refus : compte utilisable, `notifications_opt_in = false`, aucune relance intrusive (Blueprint §22).
 */
export async function registerPushToken(): Promise<Result<{ registered: boolean }>> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const off = await updateProfile({ notifications_opt_in: false, push_token: null });
      return off.error ? fail(off.error) : ok({ registered: false });
    }
    if (!Device.isDevice) return ok({ registered: false }); // pas de push sur simulateur

    await ensureAndroidChannel();
    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
      ?.eas?.projectId;
    if (!projectId) return fail(appError('unknown', 'missing_eas_project_id'));

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    const saved = await updateProfile({ push_token: token.data, notifications_opt_in: true });
    return saved.error ? fail(saved.error) : ok({ registered: true });
  } catch (e) {
    return fail(await toAppError(e));
  }
}

export interface NotificationItem {
  id: string;
  lu: boolean;
  created_at: string;
  payload: NotificationPayload;
}

export async function listNotifications(
  options: { before?: string; limit?: number } = {},
): Promise<Result<NotificationItem[]>> {
  let query = supabase
    .from('notifications')
    .select('id, lu, created_at, payload')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 30);
  if (options.before) query = query.lt('created_at', options.before);

  const result = await fromSupabase(query);
  if (result.error) return fail(result.error);
  const items: NotificationItem[] = [];
  for (const row of result.data) {
    if (isNotificationPayload(row.payload)) {
      items.push({ id: row.id, lu: row.lu, created_at: row.created_at, payload: row.payload });
    }
  }
  return ok(items);
}

export async function markRead(notificationIds: string[]): Promise<Result<true>> {
  if (notificationIds.length === 0) return ok(true);
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ lu: true })
      .in('id', notificationIds);
    if (error) return fail(await toAppError(error));
    return ok(true);
  } catch (e) {
    return fail(await toAppError(e));
  }
}

/**
 * Route ouverte au tap sur une notification : la notification renvoie vers l'app, jamais vers un contenu embarqué.
 * (`moderation` → Profil, où vit la bannière d'état du compte ; le texte suit le vocabulaire LOCKED.)
 */
export function getRouteForNotification(payload: NotificationPayload): string {
  switch (payload.type) {
    case 'new_message':
      return `/plan/${payload.plan_id}/chat`;
    case 'join_request':
    case 'request_accepted':
    case 'request_declined':
    case 'new_participant':
    case 'plan_reminder':
    case 'plan_updated':
      return `/plan/${payload.plan_id}`;
    case 'moderation':
      return '/(tabs)/profil';
  }
}
