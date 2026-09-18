// Edge Function `blocks-create` — Technical Blueprint V1.3 §13. Insère le blocage ; le trigger fn_handle_block_creator_relation retire la participation concernée.
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('blocks-create', { auth: 'user', requireAccountReady: false }, async () => {
  return notImplemented('blocks-create');
});
