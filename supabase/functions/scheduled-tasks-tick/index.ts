// Edge Function `scheduled-tasks-tick` — fallback si pg_cron est indisponible (Blueprint §38).
// Appelée toutes les 5 minutes par un scheduler externe (voir .github/workflows/scheduled-tasks.yml).
// La logique métier est en SQL (`fn_run_scheduled_tasks`) : changer de déclencheur ne réécrit aucune règle.
import { serveFunction } from '../_shared/handler.ts';
import { AppError } from '../_shared/errors.ts';

serveFunction('scheduled-tasks-tick', { auth: 'service' }, async ({ serviceClient }) => {
  const { error } = await serviceClient.rpc('fn_run_scheduled_tasks');
  if (error) throw new AppError('internal');
  return { ok: true };
});
