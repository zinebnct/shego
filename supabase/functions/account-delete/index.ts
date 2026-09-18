// Edge Function `account-delete` — Technical Blueprint V1.3 §13. Supprime photo (bucket avatars), données de profil, auth.users associé (Safety Layer §13).
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('account-delete', { auth: 'user', requireAccountReady: false }, async () => {
  return notImplemented('account-delete');
});
