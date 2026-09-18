// Edge Function `plans-update-capacity` — Technical Blueprint V1.3 §13. Créatrice uniquement ; refuse si nouvelle_capacite < count(accepted).
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('plans-update-capacity', { auth: 'user', requireAccountReady: false }, async () => {
  return notImplemented('plans-update-capacity');
});
