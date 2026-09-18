// Edge Function `participation-leave` — Technical Blueprint V1.3 §13. Libère la place et retire l'accès au chat.
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('participation-leave', { auth: 'user', requireAccountReady: false }, async () => {
  return notImplemented('participation-leave');
});
