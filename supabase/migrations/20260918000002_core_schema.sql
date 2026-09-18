-- SHEGO — Migration 2/8 : schéma cœur (13 tables)
-- Source : Technical Blueprint V1.3 §5-§8. DDL fidèle au Blueprint ; les écarts sont marqués « ÉCART ».
-- Rappel LOCKED : `users` ne contient AUCUN champ de contact téléphonique. `account_status` = 4 valeurs exactement.

set search_path = public, extensions;

-- ============ CITIES ============
create table public.cities (
  id           uuid primary key default gen_random_uuid(),
  cle          text unique not null,           -- 'casablanca'
  nom          text not null,                  -- 'Casablanca'
  actif        boolean not null default true,
  centre       geography(Point, 4326) not null,
  created_at   timestamptz not null default now()
);

-- ============ USERS ============
-- ÉCART : `id` référence auth.users(id) (Blueprint : « = auth.users.id ») avec suppression en cascade,
-- indispensable pour `account-delete` (Safety Layer §13). `push_token` : colonne citée par Blueprint §15.
create table public.users (
  id                   uuid primary key references auth.users (id) on delete cascade,
  auth_provider        text not null check (auth_provider in ('apple','google')),
  prenom               text check (char_length(prenom) between 2 and 30),   -- NULL tant que l'onboarding n'est pas complété
  date_naissance       date,                                                 -- idem — jamais exposée à d'autres utilisatrices
  ville_id             uuid references public.cities (id),                   -- idem
  bio                  text check (char_length(bio) <= 150),
  photo_url            text,                                                 -- chemin d'objet dans le bucket `avatars` ; NULL tant qu'aucune photo
  locale               text not null default 'fr' check (locale in ('fr','ar','en')),
  account_status       text not null default 'active'
                         check (account_status in ('active','under_review','suspended','banned')),
  notifications_opt_in boolean not null default false,
  location_opt_in      boolean not null default false,
  device_id            text,                                                 -- signal non biométrique (Blueprint §39)
  push_token           text,                                                 -- Expo push token (Blueprint §15)
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- ÉCART : la photo ne peut pointer que vers le fichier unique de son propriétaire (Blueprint §11).
  constraint chk_users_photo_path check (photo_url is null or photo_url = id::text || '/profile.jpg')
);

-- Majorité imposée en base, pas seulement côté client (Blueprint §8)
alter table public.users add constraint chk_users_majeure
  check (date_naissance is null or date_naissance <= (current_date - interval '18 years'));

create index idx_users_account_status on public.users (account_status);

-- ============ INTERESTS ============
create table public.interests (
  id     uuid primary key default gen_random_uuid(),
  cle    text unique not null,     -- 'cafe', 'brunch', ... (12 catégories)
  ordre  smallint not null
);

create table public.user_interests (
  user_id     uuid not null references public.users (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, interest_id)
);

-- ============ PLANS ============
-- ÉCART : `categorie_cle` est borné à la liste fermée des 12 catégories (Product Blueprint §24) — le Blueprint
-- parle d'une « FK logique vers un enum applicatif » ; une contrainte CHECK rend cette liste effective en base.
create table public.plans (
  id                  uuid primary key default gen_random_uuid(),
  creator_id          uuid not null references public.users (id),
  categorie_cle       text not null check (categorie_cle in (
                        'cafe','brunch','shopping','cinema','sport','balade',
                        'plage','concert','creatif','voyage','soiree','autre')),
  titre               text not null check (char_length(titre) <= 60),
  description         text check (char_length(description) <= 200),
  lieu                geography(Point, 4326) not null,
  lieu_public         text not null,      -- nom du lieu ou point de repère (visible avant de rejoindre)
  quartier            text not null,
  adresse_exacte      text,               -- RÈGLE 15.1 : jamais lisible via la table (privilèges colonne) ni via plans_public
  date_heure          timestamptz not null,
  places_max          smallint not null check (places_max between 2 and 20),  -- aucune valeur « illimité »
  participation_mode  text not null check (participation_mode in ('auto','request')),
  status              text not null default 'actif'
                        check (status in ('actif','complet','annule','passe')),
  city_id             uuid not null references public.cities (id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Un plan ne peut pas être créé dans le passé (« Maintenant » = heure actuelle arrondie vers le haut, côté serveur).
  constraint chk_plans_date_future check (date_heure >= created_at)
);

create index idx_plans_city_date on public.plans (city_id, date_heure);
create index idx_plans_creator on public.plans (creator_id);
create index idx_plans_status on public.plans (status);
create index idx_plans_lieu_gist on public.plans using gist (lieu);  -- obligatoire pour les requêtes de proximité (§9)
create index idx_plans_categorie on public.plans (categorie_cle);

-- ============ PLAN_PARTICIPANTS ============
create table public.plan_participants (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references public.plans (id) on delete cascade,
  user_id      uuid not null references public.users (id),
  status       text not null default 'pending'
                 check (status in ('pending','accepted','declined','cancelled','removed')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,

  unique (plan_id, user_id)   -- une seule ligne de participation par personne et par plan
);

create index idx_pp_plan on public.plan_participants (plan_id);
create index idx_pp_user on public.plan_participants (user_id);
create index idx_pp_status on public.plan_participants (plan_id, status);

-- ============ MESSAGES ============
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references public.plans (id) on delete cascade,
  sender_id   uuid references public.users (id),   -- NULL pour un message système
  contenu     text not null check (char_length(contenu) <= 1000),
  type        text not null default 'user' check (type in ('user','system')),
  created_at  timestamptz not null default now()
);

create index idx_messages_plan_created on public.messages (plan_id, created_at);

-- ============ REPORTS ============
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.users (id),
  target_type  text not null check (target_type in ('user','plan','message')),
  target_id    uuid not null,
  motif        text not null check (motif in (
                  'contenu_inapproprie','harcelement','profil_suspect',
                  'probleme_securite','autre')),
  commentaire  text check (char_length(commentaire) <= 500),
  status       text not null default 'ouvert' check (status in ('ouvert','traite','rejete')),
  reviewed_by  uuid references public.users (id),   -- compte modérateur (rôle admin)
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index idx_reports_target on public.reports (target_type, target_id);
create index idx_reports_status on public.reports (status);

-- ============ BLOCKS ============
create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.users (id),
  blocked_id  uuid not null references public.users (id),
  created_at  timestamptz not null default now(),

  unique (blocker_id, blocked_id),
  constraint chk_blocks_not_self check (blocker_id <> blocked_id)
);

create index idx_blocks_blocker on public.blocks (blocker_id);
create index idx_blocks_blocked on public.blocks (blocked_id);

-- ============ NOTIFICATIONS ============
-- Contrat des payloads : Blueprint §37 (jamais d'adresse_exacte).
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  type        text not null check (type in (
                'join_request','request_accepted','request_declined','new_participant',
                'new_message','plan_reminder','plan_updated','moderation')),
  payload     jsonb not null default '{}',
  lu          boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_unread on public.notifications (user_id, lu);

-- ============ MODERATION_ACTIONS (journal d'audit) ============
create table public.moderation_actions (
  id              uuid primary key default gen_random_uuid(),
  target_user_id  uuid not null references public.users (id),
  moderator_id    uuid references public.users (id),   -- NULL si action automatique (voir is_automatic)
  is_automatic    boolean not null default false,
  action          text not null check (action in (
                    'avertir','passer_under_review','reactiver','suspendre','bannir')),
  raison          text,
  created_at      timestamptz not null default now()
);

create index idx_moderation_target on public.moderation_actions (target_user_id);

-- ============ BEHAVIOR_SIGNALS (Safety Layer §5) ============
create table public.behavior_signals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users (id) on delete cascade,
  type_signal    text not null,  -- 'multi_account_device','high_velocity','excess_plans', ...
  valeur         jsonb not null default '{}',
  fenetre_debut  timestamptz not null,
  fenetre_fin    timestamptz not null,
  created_at     timestamptz not null default now()
);

create index idx_behavior_user on public.behavior_signals (user_id, created_at);

-- ============ APP_CONFIG ============
create table public.app_config (
  cle         text primary key,
  valeur      jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ============ TRIGGERS COMMUNS ============
create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_users_updated_at before update on public.users
  for each row execute function public.fn_set_updated_at();
create trigger trg_plans_updated_at before update on public.plans
  for each row execute function public.fn_set_updated_at();
create trigger trg_app_config_updated_at before update on public.app_config
  for each row execute function public.fn_set_updated_at();

-- Limite anti-spam : 3 plans actifs maximum par créatrice (Blueprint §8).
-- Doublon volontaire de la vérification de l'Edge Function `plans-create`.
-- Limite connue (Blueprint « Risques ») : fenêtre de course sous forte concurrence.
create or replace function public.fn_check_max_active_plans()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.plans
      where creator_id = new.creator_id and status = 'actif') >= 3
  then
    raise exception 'max_active_plans_reached';
  end if;
  return new;
end;
$$;

create trigger trg_max_active_plans
  before insert on public.plans
  for each row execute function public.fn_check_max_active_plans();
