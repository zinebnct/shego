// Edge Function `plans-update-location-time` — Technical Blueprint V1.3 §13. Créatrice uniquement ; message système + notification (plan_updated).
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction(
  'plans-update-location-time',
  { auth: 'user', requireAccountReady: false },
  async () => {
    return notImplemented('plans-update-location-time');
  },
);
