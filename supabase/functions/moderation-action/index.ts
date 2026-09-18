// Edge Function `moderation-action` — Technical Blueprint V1.3 §13. Rôle admin uniquement ; met à jour account_status et journalise dans moderation_actions.
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('moderation-action', { auth: 'admin', requireAccountReady: false }, async () => {
  return notImplemented('moderation-action');
});
