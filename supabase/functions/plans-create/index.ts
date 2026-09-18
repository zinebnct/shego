// Edge Function `plans-create` — Technical Blueprint V1.3 §13. Revérifie la condition d'accès + limite de 3 plans actifs ; filtre lexical ; crée le plan et son canal de chat.
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('plans-create', { auth: 'user', requireAccountReady: true }, async () => {
  return notImplemented('plans-create');
});
