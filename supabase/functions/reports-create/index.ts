// Edge Function `reports-create` — Technical Blueprint V1.3 §13. Insère le signalement ; le trigger fn_check_report_threshold applique le seuil (Safety Layer §7 voie B).
import { notImplemented, serveFunction } from '../_shared/handler.ts';

serveFunction('reports-create', { auth: 'user', requireAccountReady: false }, async () => {
  return notImplemented('reports-create');
});
