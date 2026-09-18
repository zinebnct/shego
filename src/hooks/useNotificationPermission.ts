import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerPushToken } from '@/services/notifications.service';
import { updateProfile } from '@/services/profile.service';

export type PermissionState = 'undetermined' | 'granted' | 'denied';

/**
 * Permission notifications — isolée dans son propre hook, jamais demandée en groupe (Blueprint §22).
 * Demandée uniquement sur l'écran 10 de l'onboarding, APRÈS l'explication maison. Un refus ne bloque jamais rien :
 * `notifications_opt_in = false`, aucune relance intrusive.
 */
export function useNotificationPermission() {
  const [state, setState] = useState<PermissionState>('undetermined');

  useEffect(() => {
    void Notifications.getPermissionsAsync().then((r) => setState(r.status));
  }, []);

  const request = useCallback(async (): Promise<PermissionState> => {
    const result = await Notifications.requestPermissionsAsync();
    setState(result.status);
    if (result.status === 'granted') await registerPushToken();
    else await updateProfile({ notifications_opt_in: false });
    return result.status;
  }, []);

  return { state, request };
}
