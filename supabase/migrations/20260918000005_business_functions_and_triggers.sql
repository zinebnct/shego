-- SHEGO — Migration 5/8 : fonctions métier et triggers
-- Source : Technical Blueprint V1.3 §9 (découverte élastique), §15 + §37 (notifications), §17 (seuil de signalements),
-- §19 (blocage impliquant la créatrice), §39 (signal device).

set search_path = public, extensions;

-- ===========================================================================
-- 1. Découverte élastique (Blueprint §9) — RPC `fn_discover_plans`
-- ===========================================================================
-- Retourne des identifiants, des distances et le palier ; la position GPS passée en paramètre n'est JAMAIS persistée.
-- ÉCARTS par rapport à l'exemple du Blueprint :
--  * une seule liste finale au lieu d'un `return query` par palier (l'exemple renvoyait les mêmes plans plusieurs fois) ;
--  * paliers lus dans app_config (`discovery_radii_m`) comme le Blueprint le prévoit « en pratique » ;
--  * le filtre de catégorie s'applique aussi au comptage du volume cible (mêmes filtres que la liste affichée) ;
--  * `palier` = plus petit rayon contenant le plan, 0 = au-delà (ville entière).
-- Les fenêtres temporelles (aujourd'hui → 7 jours → tous) sont appliquées par l'Edge Function `plans-discover`.
-- Fonction `security invoker` : la RLS de `plans` s'applique (blocages, adresse exacte non lue).
create or replace function public.fn_discover_plans(
  p_lat double precision,
  p_lng double precision,
  p_city_id uuid,
  p_categorie text default null,
  p_max_results int default 30
)
returns table (plan_id uuid, distance_m double precision, palier int)
language plpgsql
stable
set search_path = public, extensions
as $$
declare
  v_point  geography := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
  v_radii  int[];
  v_target int;
  v_radius int;
  v_chosen int := null;
begin
  select array(select jsonb_array_elements_text(valeur)::int)
    into v_radii
    from public.app_config where cle = 'discovery_radii_m';
  if v_radii is null or array_length(v_radii, 1) is null then
    v_radii := array[3000, 8000, 20000];
  end if;

  select (valeur ->> 'volume_cible')::int into v_target
    from public.app_config where cle = 'discovery_target_volume';
  v_target := coalesce(v_target, 10);

  -- Plus petit palier qui offre déjà le volume cible ; sinon ville entière.
  foreach v_radius in array v_radii loop
    if (
      select count(*) from public.plans p
      where p.status = 'actif'
        and (p_categorie is null or p.categorie_cle = p_categorie)
        and ST_DWithin(p.lieu, v_point, v_radius)
    ) >= v_target then
      v_chosen := v_radius;
      exit;
    end if;
  end loop;

  return query
    select p.id,
           ST_Distance(p.lieu, v_point),
           coalesce((select min(r) from unnest(v_radii) r where r >= ST_Distance(p.lieu, v_point)), 0)
    from public.plans p
    where p.status = 'actif'
      and (p_categorie is null or p.categorie_cle = p_categorie)
      and (
        (v_chosen is not null and ST_DWithin(p.lieu, v_point, v_chosen))
        or (v_chosen is null and p.city_id = p_city_id)
      )
    order by
      case when v_chosen is not null then ST_Distance(p.lieu, v_point) end,
      p.date_heure
    limit p_max_results;
end;
$$;

revoke execute on function public.fn_discover_plans(double precision, double precision, uuid, text, int) from public, anon;
grant execute on function public.fn_discover_plans(double precision, double precision, uuid, text, int) to authenticated, service_role;

-- ===========================================================================
-- 2. Signalements : seuil → under_review automatique (Blueprint §17, Safety Layer §7 voie B)
-- ===========================================================================
-- Un signalement isolé (voie A) n'exécute AUCUNE action. Le blocage de Create/Join/Chat est porté par la RLS.
-- ÉCART : le journal n'est alimenté que lorsque le statut change réellement (évite un doublon à chaque signalement suivant).
create or replace function public.fn_check_report_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_threshold int;
  v_count     int;
  v_changed   int;
begin
  select (valeur ->> 'seuil')::int into v_threshold
    from public.app_config where cle = 'report_threshold_under_review';
  v_threshold := coalesce(v_threshold, 3);

  select count(distinct reporter_id) into v_count
  from public.reports
  where target_type = 'user' and target_id = new.target_id
    and created_at > now() - interval '7 days';

  if v_count >= v_threshold then
    update public.users set account_status = 'under_review'
      where id = new.target_id and account_status = 'active';
    get diagnostics v_changed = row_count;
    if v_changed > 0 then
      insert into public.moderation_actions (target_user_id, moderator_id, is_automatic, action, raison)
      values (new.target_id, null, true, 'passer_under_review', 'seuil de signalements atteint (automatique)');
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_check_report_threshold
  after insert on public.reports
  for each row when (new.target_type = 'user')
  execute function public.fn_check_report_threshold();

-- ===========================================================================
-- 3. Blocage impliquant la créatrice → retrait du plan (Blueprint §19, Plan Group Chat §8)
-- ===========================================================================
-- Blocage entre simples participantes : aucune ligne modifiée, masquage en lecture uniquement (RLS).
-- ÉCART : les demandes en attente sont aussi retirées (« blocage bilatéral et total : plans, chat, profil, demandes »).
create or replace function public.fn_handle_block_creator_relation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.plan_participants pp
  set status = 'removed', responded_at = now()
  from public.plans p
  where pp.plan_id = p.id
    and (
      (p.creator_id = new.blocker_id and pp.user_id = new.blocked_id)
      or (p.creator_id = new.blocked_id and pp.user_id = new.blocker_id)
    )
    and pp.status in ('pending','accepted');
  return new;
end;
$$;

create trigger trg_block_creator_relation
  after insert on public.blocks
  for each row execute function public.fn_handle_block_creator_relation();

-- ===========================================================================
-- 4. Notifications transactionnelles (Blueprint §15, contrat de payload §37)
-- ===========================================================================
-- Sept types issus des specs + `moderation`. AUCUN payload ne contient `adresse_exacte`
-- (les notifications transitent par Expo/APNs/FCM, hors du périmètre RLS).
-- L'appel à `notifications-dispatch` se fait via un Database Webhook sur INSERT de `notifications` (voir README).

create or replace function public.fn_notify_participation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_creator uuid;
  v_plan_titre   text;
  v_prenom       text;
begin
  select creator_id, titre into v_plan_creator, v_plan_titre from public.plans where id = new.plan_id;
  select prenom into v_prenom from public.users where id = new.user_id;

  if tg_op = 'INSERT' then
    if new.status = 'pending' then
      insert into public.notifications (user_id, type, payload)
      values (v_plan_creator, 'join_request', jsonb_build_object(
        'type', 'join_request', 'plan_id', new.plan_id, 'plan_titre', v_plan_titre,
        'requester_id', new.user_id, 'requester_prenom', v_prenom));
    elsif new.status = 'accepted' then
      insert into public.notifications (user_id, type, payload)
      values (v_plan_creator, 'new_participant', jsonb_build_object(
        'type', 'new_participant', 'plan_id', new.plan_id, 'plan_titre', v_plan_titre,
        'participant_id', new.user_id, 'participant_prenom', v_prenom));
    end if;
  elsif tg_op = 'UPDATE' and old.status = 'pending' then
    if new.status = 'accepted' then
      insert into public.notifications (user_id, type, payload)
      values (new.user_id, 'request_accepted', jsonb_build_object(
        'type', 'request_accepted', 'plan_id', new.plan_id, 'plan_titre', v_plan_titre));
    elsif new.status = 'declined' then
      -- formulation neutre côté UI : refus silencieux sur le motif (Blueprint produit §3.6)
      insert into public.notifications (user_id, type, payload)
      values (new.user_id, 'request_declined', jsonb_build_object(
        'type', 'request_declined', 'plan_id', new.plan_id, 'plan_titre', v_plan_titre));
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_notify_participation
  after insert or update of status on public.plan_participants
  for each row execute function public.fn_notify_participation();

-- Nouveau message : une notification par destinataire (créatrice + participantes acceptées, hors expéditrice,
-- hors comptes bloqués, hors comptes non actifs — un compte under_review n'a pas accès au chat).
-- Le regroupement « 3 nouveaux messages » est fait par `notifications-dispatch`, jamais ici.
create or replace function public.fn_notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_titre  text;
  v_prenom text;
begin
  if new.type <> 'user' or new.sender_id is null then
    return new;
  end if;

  select titre into v_titre from public.plans where id = new.plan_id;
  select prenom into v_prenom from public.users where id = new.sender_id;

  insert into public.notifications (user_id, type, payload)
  select r.user_id, 'new_message', jsonb_build_object(
           'type', 'new_message', 'plan_id', new.plan_id, 'plan_titre', v_titre,
           'sender_id', new.sender_id, 'sender_prenom', v_prenom,
           'preview', left(new.contenu, 80))
  from (
    select p.creator_id as user_id from public.plans p where p.id = new.plan_id
    union
    select pp.user_id from public.plan_participants pp where pp.plan_id = new.plan_id and pp.status = 'accepted'
  ) r
  where r.user_id <> new.sender_id
    and public.fn_is_account_active(r.user_id)
    and not public.fn_is_blocked_between(r.user_id, new.sender_id);

  return new;
end;
$$;

create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute function public.fn_notify_new_message();

-- Lieu ou heure modifiés : « quelque chose a changé » — le détail se lit dans l'app, jamais dans le push.
create or replace function public.fn_notify_plan_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_champ text;
begin
  for v_champ in
    select c from (
      select 'lieu' as c
        where old.lieu::text is distinct from new.lieu::text
           or old.lieu_public is distinct from new.lieu_public
           or old.quartier is distinct from new.quartier
           or old.adresse_exacte is distinct from new.adresse_exacte
      union all
      select 'date_heure' as c
        where old.date_heure is distinct from new.date_heure
    ) changes
  loop
    insert into public.notifications (user_id, type, payload)
    select pp.user_id, 'plan_updated', jsonb_build_object(
             'type', 'plan_updated', 'plan_id', new.id, 'plan_titre', new.titre, 'champ_modifie', v_champ)
    from public.plan_participants pp
    where pp.plan_id = new.id and pp.status = 'accepted';
  end loop;
  return new;
end;
$$;

create trigger trg_notify_plan_updated
  after update of lieu, lieu_public, quartier, adresse_exacte, date_heure on public.plans
  for each row execute function public.fn_notify_plan_updated();

-- Changement de statut de compte : payload minimal à dessein (Blueprint §37) ; le texte affiché suit le vocabulaire LOCKED.
create or replace function public.fn_notify_account_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_status is distinct from old.account_status then
    insert into public.notifications (user_id, type, payload)
    values (new.id, 'moderation', jsonb_build_object('type', 'moderation', 'account_status', new.account_status));
  end if;
  return new;
end;
$$;

create trigger trg_notify_account_status
  after update of account_status on public.users
  for each row execute function public.fn_notify_account_status();

-- ===========================================================================
-- 5. Signal device (Blueprint §39) — collecte uniquement, aucune action automatique en V1
-- ===========================================================================
create or replace function public.fn_check_device_multi_account(p_device_id text)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.users
  where device_id = p_device_id
    and created_at > now() - interval '24 hours';
$$;

-- ===========================================================================
-- 6. Liste des comptes bloqués (Paramètres) — nécessaire car `public_profiles` masque les comptes bloqués
-- ===========================================================================
create or replace function public.fn_list_blocked()
returns table (blocked_id uuid, prenom text, photo_url text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select b.blocked_id, u.prenom, u.photo_url, b.created_at
  from public.blocks b
  join public.users u on u.id = b.blocked_id
  where b.blocker_id = auth.uid()
  order by b.created_at desc;
$$;

revoke execute on function public.fn_list_blocked() from public, anon;
grant execute on function public.fn_list_blocked() to authenticated, service_role;

-- Fonctions de trigger / internes : jamais appelables via l'API.
revoke execute on function public.fn_check_report_threshold() from public, anon, authenticated;
revoke execute on function public.fn_handle_block_creator_relation() from public, anon, authenticated;
revoke execute on function public.fn_notify_participation() from public, anon, authenticated;
revoke execute on function public.fn_notify_new_message() from public, anon, authenticated;
revoke execute on function public.fn_notify_plan_updated() from public, anon, authenticated;
revoke execute on function public.fn_notify_account_status() from public, anon, authenticated;
revoke execute on function public.fn_check_device_multi_account(text) from public, anon, authenticated;
grant execute on function public.fn_check_device_multi_account(text) to service_role;
