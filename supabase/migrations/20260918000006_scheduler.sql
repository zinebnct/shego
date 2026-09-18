-- SHEGO — Migration 6/8 : tâches planifiées (Blueprint §38)
-- La logique métier vit dans des fonctions SQL ; seul le déclencheur change :
--   * pg_cron si l'extension est disponible sur le projet (stratégie primaire) ;
--   * sinon l'Edge Function `scheduled-tasks-tick` (appelle `fn_run_scheduled_tasks`) déclenchée toutes les 5 minutes
--     par un scheduler externe (fallback prévu, voir .github/workflows/scheduled-tasks.yml).

-- Demandes `pending` expirées à l'heure du plan (Blueprint produit §3.6) — le trigger de notification
-- prévient la demandeuse avec la formulation neutre `request_declined`.
create or replace function public.fn_expire_pending_requests()
returns void
language sql
security definer
set search_path = public
as $$
  update public.plan_participants
  set status = 'declined', responded_at = now()
  where status = 'pending'
    and plan_id in (select id from public.plans where date_heure <= now());
$$;

-- Archivage : `passe` 24 h après l'heure du plan → chat en lecture seule (messages_insert exige actif/complet).
create or replace function public.fn_archive_past_plans()
returns void
language sql
security definer
set search_path = public
as $$
  update public.plans
  set status = 'passe'
  where status in ('actif','complet')
    and date_heure <= now() - interval '24 hours';
$$;

-- Rappel 1 h avant le plan. Jamais d'adresse exacte dans le payload (Blueprint §37).
-- La fenêtre 55-65 min évite les doublons d'un job à 5 min ; `not exists` est une seconde garde.
create or replace function public.fn_dispatch_plan_reminders()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, type, payload)
  select pp.user_id, 'plan_reminder',
         jsonb_build_object('type', 'plan_reminder', 'plan_id', p.id, 'plan_titre', p.titre,
                            'date_heure', p.date_heure, 'lieu_public', p.lieu_public)
  from public.plans p
  join public.plan_participants pp on pp.plan_id = p.id and pp.status = 'accepted'
  where p.date_heure between now() + interval '55 minutes' and now() + interval '65 minutes'
    and p.status = 'actif'
    and not exists (
      select 1 from public.notifications n
      where n.user_id = pp.user_id and n.type = 'plan_reminder'
        and n.payload ->> 'plan_id' = p.id::text
    );
$$;

-- Point d'entrée unique du fallback (Edge Function `scheduled-tasks-tick`).
create or replace function public.fn_run_scheduled_tasks()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.fn_expire_pending_requests();
  perform public.fn_archive_past_plans();
  perform public.fn_dispatch_plan_reminders();
end;
$$;

revoke execute on function public.fn_expire_pending_requests() from public, anon, authenticated;
revoke execute on function public.fn_archive_past_plans() from public, anon, authenticated;
revoke execute on function public.fn_dispatch_plan_reminders() from public, anon, authenticated;
revoke execute on function public.fn_run_scheduled_tasks() from public, anon, authenticated;
grant execute on function public.fn_run_scheduled_tasks() to service_role;

-- Planification pg_cron — uniquement si l'extension est disponible (sans effet en local sans pg_cron).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('expire-pending-requests', '*/5 * * * *',  'select public.fn_expire_pending_requests()');
    perform cron.schedule('archive-past-plans',      '*/15 * * * *', 'select public.fn_archive_past_plans()');
    perform cron.schedule('dispatch-plan-reminders', '*/5 * * * *',  'select public.fn_dispatch_plan_reminders()');
  end if;
end;
$$;
