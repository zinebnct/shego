// Edge Function `plan-cancel` — Technical Blueprint V1.3 §13. Créatrice uniquement ; statut -> annule, message système, notifications.
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('plan-cancel', { auth: 'user', requireAccountReady: false }, async () => {
  return notImplemented('plan-cancel');
});
