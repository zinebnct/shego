// Edge Function `notifications-dispatch` — Technical Blueprint V1.3 §13. Déclenché par Database Webhook (INSERT notifications) ; construit le push Expo, regroupe les messages (§15). Jamais d'adresse exacte.
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction(
  'notifications-dispatch',
  { auth: 'service', requireAccountReady: false },
  async () => {
    return notImplemented('notifications-dispatch');
  },
);
