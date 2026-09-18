// Edge Function `participation-join` — Technical Blueprint V1.3 §13. Vérifie condition d'accès, blocage, places ; insère accepted (mode auto) ou pending (mode request).
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('participation-join', { auth: 'user', requireAccountReady: true }, async () => {
  return notImplemented('participation-join');
});
