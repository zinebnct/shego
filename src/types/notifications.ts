/**
 * Contrat des payloads de notification — Technical Blueprint V1.3 §37 (stocké tel quel dans `notifications.payload`).
 * Ces 8 types sont les SEULS existants : Blueprint produit §14 (transactionnelles uniquement, aucune notification marketing).
 * Aucun payload ne contient `adresse_exacte` (les notifications transitent par Expo/APNs/FCM, hors RLS).
 */
export type NotificationPayload =
  | {
      type: 'join_request';
      plan_id: string;
      plan_titre: string;
      requester_id: string;
      requester_prenom: string;
    }
  | { type: 'request_accepted'; plan_id: string; plan_titre: string }
  | { type: 'request_declined'; plan_id: string; plan_titre: string }
  | {
      type: 'new_participant';
      plan_id: string;
      plan_titre: string;
      participant_id: string;
      participant_prenom: string;
    }
  | {
      type: 'new_message';
      plan_id: string;
      plan_titre: string;
      sender_id: string;
      sender_prenom: string;
      preview: string;
      grouped_count?: number;
    }
  | {
      type: 'plan_reminder';
      plan_id: string;
      plan_titre: string;
      date_heure: string;
      lieu_public: string;
    }
  | {
      type: 'plan_updated';
      plan_id: string;
      plan_titre: string;
      champ_modifie: 'lieu' | 'date_heure';
    }
  | { type: 'moderation'; account_status: 'under_review' | 'suspended' | 'banned' | 'active' };

export type NotificationType = NotificationPayload['type'];

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  'join_request',
  'request_accepted',
  'request_declined',
  'new_participant',
  'new_message',
  'plan_reminder',
  'plan_updated',
  'moderation',
];

export const isNotificationPayload = (value: unknown): value is NotificationPayload =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { type?: unknown }).type === 'string' &&
  (NOTIFICATION_TYPES as readonly string[]).includes((value as { type: string }).type);
