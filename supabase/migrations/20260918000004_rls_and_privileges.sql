-- SHEGO — Migration 4/8 : RLS, privilèges, vues
-- Source : Technical Blueprint V1.3 §12 (« RLS activée sur toutes les tables dès la première migration »),
-- §31 (« RLS activée sur 100% des tables, aucune exception »), Blueprint produit §15.1 (adresse exacte).
--
-- Principes :
--  * `anon` n'a accès à rien : SHEGO exige une session Apple/Google pour toute lecture.
--  * `authenticated` reçoit des privilèges minimaux (colonnes comprises) ; la RLS filtre ensuite les lignes.
--  * Toute règle sensible (compte prêt, under_review, blocage, adresse exacte) est portée par le SERVEUR.
--
-- Les écarts au DDL/policies d'exemple du Blueprint sont marqués « ÉCART » avec leur raison.

set search_path = public, extensions;

-- ===========================================================================
-- 1. RLS sur TOUTES les tables (le Blueprint n'en liste que 9 ; on couvre les 13)
-- ===========================================================================
alter table public.cities             enable row level security;
alter table public.users              enable row level security;
alter table public.interests          enable row level security;
alter table public.user_interests     enable row level security;
alter table public.plans              enable row level security;
alter table public.plan_participants  enable row level security;
alter table public.messages           enable row level security;
alter table public.reports            enable row level security;
alter table public.blocks             enable row level security;
alter table public.notifications      enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.behavior_signals   enable row level security;
alter table public.app_config         enable row level security;

-- ===========================================================================
-- 2. Privilèges de table (Supabase accorde ALL par défaut : on retire puis on redonne le strict nécessaire)
-- ===========================================================================
revoke all on public.cities, public.users, public.interests, public.user_interests, public.plans,
              public.plan_participants, public.messages, public.reports, public.blocks,
              public.notifications, public.moderation_actions, public.behavior_signals, public.app_config
  from anon, authenticated;

grant select on public.cities to authenticated;
grant select on public.interests to authenticated;
grant select, insert, delete on public.user_interests to authenticated;

-- users : lecture de SA ligne uniquement (policy) ; écriture limitée aux champs de profil.
-- `account_status`, `auth_provider`, `id`, `created_at` ne sont JAMAIS modifiables par le client :
-- sans cela, une utilisatrice `under_review` pourrait se remettre `active` (règle binaire du Blueprint §6.4bis).
grant select on public.users to authenticated;
grant update (prenom, date_naissance, ville_id, bio, photo_url, locale,
              notifications_opt_in, location_opt_in, device_id, push_token)
  on public.users to authenticated;

-- plans : `adresse_exacte` est exclue du SELECT — elle n'est lisible que via `plans_full` (règle 15.1).
-- Conséquence : le client ne doit jamais faire `select *` sur `plans` ; il lit `plans_public` / `plans_full`.
-- Aucun UPDATE/DELETE client : capacité, lieu/heure et annulation passent par les Edge Functions
-- (`plans-update-capacity`, `plans-update-location-time`, `plan-cancel`) qui revérifient les règles métier.
grant select (id, creator_id, categorie_cle, titre, description, lieu, lieu_public, quartier,
              date_heure, places_max, participation_mode, status, city_id, created_at, updated_at)
  on public.plans to authenticated;
grant insert on public.plans to authenticated;

grant select on public.plan_participants to authenticated;
grant insert (plan_id, user_id, status) on public.plan_participants to authenticated;

grant select on public.messages to authenticated;
grant insert (plan_id, sender_id, contenu, type) on public.messages to authenticated;

grant select on public.reports to authenticated;
grant insert (reporter_id, target_type, target_id, motif, commentaire) on public.reports to authenticated;
grant update (status, reviewed_by, reviewed_at) on public.reports to authenticated;  -- réservé admin (policy)

grant select, insert, delete on public.blocks to authenticated;

grant select on public.notifications to authenticated;
grant update (lu) on public.notifications to authenticated;

grant select on public.moderation_actions to authenticated;  -- réservé admin (policy) ; écriture via Edge Function
-- behavior_signals : aucun privilège client (collecte et lecture service uniquement).
grant select on public.app_config to authenticated;          -- une seule clé publique (policy)

-- ===========================================================================
-- 3. USERS
-- ===========================================================================
create policy users_select_self on public.users for select to authenticated
  using (auth.uid() = id);

create policy users_update_self on public.users for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ÉCART : le Blueprint ouvre `users` aux participantes via une policy de ligne ; une policy ne peut pas
-- masquer de colonnes, ce qui aurait exposé `date_naissance`, `device_id`, `push_token` et `account_status`
-- (« l'âge est visible, pas la date de naissance » — Onboarding écran 5).
-- Les autres profils sont lus via la vue `public_profiles` (colonnes minimales : Avatar · Prénom · Âge · Ville · bio).
-- La précédence `OR … AND NOT …` de la policy d'origine est en outre corrigée (blocage appliqué à toutes les branches).
create view public.public_profiles as
select
  u.id,
  u.prenom,
  date_part('year', age(current_date, u.date_naissance))::int as age,
  u.ville_id,
  u.bio,
  u.photo_url
from public.users u
where u.prenom is not null
  and (
    u.id = auth.uid()
    or (
      not public.fn_is_blocked_between(auth.uid(), u.id)
      and (
        -- créatrice d'un plan visible (carte de plan, détail)
        exists (
          select 1 from public.plans p
          where p.creator_id = u.id and p.status in ('actif','complet')
        )
        -- contexte de plan : la créatrice voit demandeuses et participantes ; une participante acceptée
        -- voit la créatrice et les autres participantes acceptées (Blueprint produit §7.2).
        or exists (
          select 1 from public.plans p
          where (
            p.creator_id = auth.uid()
            and exists (
              select 1 from public.plan_participants pp
              where pp.plan_id = p.id and pp.user_id = u.id and pp.status in ('pending','accepted')
            )
          ) or (
            exists (
              select 1 from public.plan_participants me
              where me.plan_id = p.id and me.user_id = auth.uid() and me.status = 'accepted'
            )
            and (
              p.creator_id = u.id
              or exists (
                select 1 from public.plan_participants pp
                where pp.plan_id = p.id and pp.user_id = u.id and pp.status = 'accepted'
              )
            )
          )
        )
      )
    )
  );

-- ===========================================================================
-- 4. REFERENTIELS ET CONFIG
-- ===========================================================================
create policy cities_select on public.cities for select to authenticated using (true);
create policy interests_select on public.interests for select to authenticated using (true);

create policy user_interests_select_own on public.user_interests for select to authenticated
  using (user_id = auth.uid());
create policy user_interests_insert_own on public.user_interests for insert to authenticated
  with check (user_id = auth.uid());
create policy user_interests_delete_own on public.user_interests for delete to authenticated
  using (user_id = auth.uid());

-- Seule la clé des défauts de mode par catégorie est lisible par l'app (Blueprint produit §3.3 : paramétrable serveur).
create policy app_config_select_public on public.app_config for select to authenticated
  using (cle = 'category_default_modes');

-- ===========================================================================
-- 5. PLANS
-- ===========================================================================
-- Découverte : plans à venir non bloqués (bilatéralement). ÉCART : blocage via fn_is_blocked_between, et
-- `complet` inclus (le Blueprint autorise déjà ce statut dans messages_insert).
create policy plans_select_discover on public.plans for select to authenticated
  using (
    status in ('actif','complet')
    and not public.fn_is_blocked_between(auth.uid(), creator_id)
  );

-- ÉCART : sans cette policy, une créatrice ne verrait plus ses plans annulés/passés ni une participante
-- un plan passé (Mes plans, chat en lecture seule — Plan Group Chat §10-11).
create policy plans_select_own_or_member on public.plans for select to authenticated
  using (public.fn_is_plan_member(id, auth.uid()));

-- Création : condition d'accès complète vérifiée en RLS (RLS = barrière réelle ; l'Edge Function ne fait
-- que produire un message d'erreur exploitable). under_review / suspended / banned sont exclus.
create policy plans_insert_if_ready on public.plans for insert to authenticated
  with check (
    auth.uid() = creator_id
    and status = 'actif'
    and public.fn_is_account_ready(auth.uid())
  );

-- Vue publique : SANS `adresse_exacte`. security_invoker => la RLS de `plans` s'applique à l'appelante.
create view public.plans_public with (security_invoker = true) as
select id, creator_id, categorie_cle, titre, description, lieu, lieu_public,
       quartier, date_heure, places_max, participation_mode, status, city_id
from public.plans;

-- Vue complète (avec adresse exacte) : créatrice ou participante ACCEPTÉE uniquement (règle 15.1).
-- Volontairement exécutée avec les droits du propriétaire (seul moyen de lire la colonne restreinte) ;
-- le filtre `auth.uid()` ci-dessous est LA barrière — ne jamais l'élargir.
create view public.plans_full as
select p.*
from public.plans p
where p.creator_id = auth.uid()
   or exists (
     select 1 from public.plan_participants pp
     where pp.plan_id = p.id and pp.user_id = auth.uid() and pp.status = 'accepted'
   );

revoke all on public.public_profiles, public.plans_public, public.plans_full from anon, authenticated;
grant select on public.public_profiles, public.plans_public, public.plans_full to authenticated;

-- ===========================================================================
-- 6. PLAN_PARTICIPANTS
-- ===========================================================================
-- Lecture : ses lignes, celles de ses plans (créatrice), et les participantes acceptées d'un plan dont on est membre.
create policy pp_select on public.plan_participants for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.plans p where p.id = plan_id and p.creator_id = auth.uid())
    or (
      status = 'accepted'
      and public.fn_is_plan_member(plan_id, auth.uid())
      and not public.fn_is_blocked_between(auth.uid(), user_id)
    )
  );

-- Insertion directe : uniquement une DEMANDE (`pending`) sur un plan actif, non bloqué, par un compte prêt.
-- Les acceptations (mode `auto`, décision de la créatrice) passent par les Edge Functions `participation-*`
-- (service role) qui contrôlent aussi les places. under_review exclu via fn_is_account_ready.
create policy pp_insert_if_ready on public.plan_participants for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and public.fn_is_account_ready(auth.uid())
    and exists (
      select 1 from public.plans p
      where p.id = plan_id
        and p.status = 'actif'
        and p.creator_id <> auth.uid()
        and not public.fn_is_blocked_between(auth.uid(), p.creator_id)
    )
  );

-- ===========================================================================
-- 7. MESSAGES — chat réservé aux membres du plan, compte actif requis (under_review ⇒ aucun Chat)
-- ===========================================================================
create policy messages_select on public.messages for select to authenticated
  using (
    public.fn_is_account_active(auth.uid())
    and public.fn_is_plan_member(plan_id, auth.uid())
    and (sender_id is null or not public.fn_is_blocked_between(auth.uid(), sender_id))
  );

create policy messages_insert on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and type = 'user'
    and public.fn_is_account_active(auth.uid())
    and exists (select 1 from public.plans p where p.id = plan_id and p.status in ('actif','complet'))
    and public.fn_is_plan_member(plan_id, auth.uid())
  );

-- ===========================================================================
-- 8. BLOCKS / REPORTS
-- ===========================================================================
create policy blocks_select_own on public.blocks for select to authenticated using (blocker_id = auth.uid());
create policy blocks_insert_own on public.blocks for insert to authenticated with check (blocker_id = auth.uid());
-- ÉCART : le déblocage en un tap (Design System §14, Paramètres) exige un DELETE ; absent du Blueprint.
create policy blocks_delete_own on public.blocks for delete to authenticated using (blocker_id = auth.uid());

create policy reports_insert_own on public.reports for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and not (target_type = 'user' and target_id = auth.uid())
  );
create policy reports_select_own on public.reports for select to authenticated using (reporter_id = auth.uid());

-- ===========================================================================
-- 9. NOTIFICATIONS
-- ===========================================================================
create policy notifications_select_own on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());   -- seule la colonne `lu` est modifiable (privilège)

-- ===========================================================================
-- 10. MODÉRATION (rôle admin uniquement — claim `app_metadata.role`, voir fn_is_admin)
-- ===========================================================================
create policy moderation_admin_all on public.moderation_actions for all to authenticated
  using (public.fn_is_admin());
create policy reports_admin_all on public.reports for all to authenticated
  using (public.fn_is_admin());
-- behavior_signals : RLS activée, aucune policy => inaccessible aux clients (service role uniquement).
