# SHEGO — TECHNICAL BLUEPRINT V1.3

Traduction technique directement exploitable des 8 spécifications produit LOCKED. Ce document ne modifie aucune décision produit — il les implémente. Chaque décision technique est taguée **CORE MVP**, **LATER** ou **OPTIONNELLE**.

> **V1.3 — réconciliation complète.** Le Blueprint (V1.3), l'Onboarding (V1.3) et la Safety Layer (V1.1) ont été révisés dans la même passe que ce document pour adopter Sign in with Apple / Sign in with Google comme mécanisme d'authentification officiel. **Les trois contradictions signalées en V1.2 sont résolues** : ce Technical Blueprint est désormais une traduction fidèle de specs produit elles-mêmes alignées, plus une traduction en avance sur des specs qui ne l'étaient pas encore. **Décision supplémentaire de cette passe** : `users.phone` est supprimé intégralement du schéma — aucune donnée de téléphone n'est collectée, stockée ou déclarée pour le MVP ; un numéro deviendra un ajout de migration future si un jour nécessaire, pas un champ anticipé aujourd'hui.
>
> Périmètre : plans, capacité 2-20, limite de 3 plans actifs, participation, chat, règle 15.1 de l'adresse exacte, reports, blocks, modération, `under_review`, absence de biométrie — **tous inchangés**.

> Source de vérité produit : Blueprint V1.3, Design System V1.3, Home V1.3, Create Plan V1.3, Plan Detail + Join V1.3, Plan Group Chat V1, Safety Layer V1.1, Onboarding V1.3.

---

## 1. Architecture générale

```
┌─────────────────────┐     ┌──────────────────────────┐
│   App mobile          │     │   Supabase (backend managé) │
│   React Native/Expo   │────▶│  - Postgres + PostGIS     │
│   iOS / Android        │◀────│  - Auth (Sign in with Apple / Google) │
└─────────────────────┘     │  - Storage (photos)        │
                             │  - Realtime (chat)         │
┌─────────────────────┐     │  - Edge Functions          │
│   Backoffice web       │────▶│  (Deno, TypeScript)        │
│   (modération)         │◀────│                            │
└─────────────────────┘     └──────────────────────────┘
                                        │
                             ┌──────────────────────────┐
                             │  Expo Push Notification   │
                             │  Service (EAS)              │
                             └──────────────────────────┘

```

**CORE MVP** — Une seule base de données Postgres (Supabase), un seul projet Supabase par environnement (dev/staging/prod, §26). Pas de microservices, pas de backend custom séparé : toute la logique serveur passe par RLS + Edge Functions. C'est le choix qui garde le MVP livrable par une petite équipe.

**LATER** — Service tiers de modération de contenu automatique (Safety Layer §16), service de traduction pour l'arabe/anglais (i18n prête, non activée).

---

## 2. Structure du repository

**CORE MVP**

```
shego/
├── app/                        # Expo Router — écrans par route
│   ├── (onboarding)/
│   │   ├── welcome.tsx
│   │   ├── welcome-confiance.tsx
│   │   ├── auth.tsx              # Sign in with Apple / Google
│   │   ├── prenom.tsx
│   │   ├── date-naissance.tsx
│   │   ├── ville.tsx
│   │   ├── photo.tsx
│   │   ├── interets.tsx
│   │   ├── bio.tsx
│   │   ├── permissions-notifications.tsx
│   │   └── permissions-localisation.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── mes-plans.tsx
│   │   ├── messages.tsx
│   │   └── profil.tsx
│   ├── plan/
│   │   ├── [id]/index.tsx      # Plan Detail
│   │   └── [id]/chat.tsx       # Plan Chat
│   ├── create-plan.tsx         # modal/sheet
│   └── settings/
├── src/
│   ├── components/             # organisés par domaine (voir §4)
│   ├── hooks/                  # useAuth, usePlans, useChat, ...
│   ├── services/                # appels Supabase typés (voir §21)
│   ├── stores/                  # état client léger (Zustand ou Context)
│   ├── design-system/           # tokens, primitives (voir §4)
│   ├── i18n/                    # fr.json (ar.json, en.json en LATER)
│   └── types/                   # types générés depuis le schéma DB
├── supabase/
│   ├── migrations/              # SQL versionné (voir §6)
│   ├── functions/               # Edge Functions (Deno)
│   └── seed.sql                 # données de développement
├── backoffice/                  # app web modération (Next.js ou équivalent), séparée
├── e2e/                          # tests Detox/Maestro (voir §30)
└── .github/workflows/           # CI (voir §27)

```

**Justification** : Expo Router donne une correspondance directe route ↔ écran, ce qui facilite la traçabilité vers les 11 écrans d'Onboarding V1.3 et les écrans de la boucle DISCOVER→CREATE→JOIN→CHAT. Le dossier `services/` isole tous les appels réseau : aucun composant ne parle directement à Supabase (voir §21).

---

## 3. Architecture des écrans et navigation

**CORE MVP** — Reprend exactement Design System V1.3 §11 et Blueprint §19.

| **PileÉcransType de navigation** |                                                          |                                                               |
| -------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Onboarding                       | 11 écrans (Onboarding V1.3 — voir §3)                    | Stack plein écran, pas de tab bar, back désactivé sur écran 1 |
| Tabs (post-onboarding)           | Home, Mes plans, Messages, Profil + bouton central Créer | Bottom tab navigator, 4 routes + action centrale              |
| Plan Detail                      | Poussé depuis Home/Carte/Mes plans/notification          | Stack, transition carte→hero partagée (Plan Detail §16)       |
| Plan Chat                        | Poussé depuis Plan Detail ou Messages                    | Stack                                                         |
| Create Plan                      | Modal/sheet plein écran depuis le bouton central         | Presentation modal, pas dans la pile Tabs                     |
| Settings                         | Poussé depuis Profil                                     | Stack                                                         |

**Garde de navigation (route guard) — CORE MVP** : un hook `useAccountReady()` centralise la condition d'accès (Blueprint §6.4) et bloque l'entrée dans Create Plan et l'action Join, redirigeant vers les feuilles "ce qui manque" ou `under_review` (Create Plan V1.3 §12) — cohérent avec la règle que ces feuilles sont **un seul composant partagé**, jamais dupliqué (voir §4).

---

## 4. Architecture des composants

**CORE MVP** — Organisation par domaine, alignée sur l'inventaire du Design System V1.3 §19 (43 composants) :

```
src/components/
├── foundation/       Text, Icon, Screen, Divider
├── actions/          Button, IconButton, Chip, SegmentedControl
├── plan/             PlanCard, CategoryTile, TimePill, ModeBadge,
│                      SeatsIndicator, DistanceLabel, ParticipantRow,
│                      PlanActionBar, PlanHeader
├── profile/           Avatar, IdentityBlock, InterestTags,
│                      SafetyNotice, ModerationBanner
├── navigation/        TabBar, TabBadge, NavHeader, MapListToggle
├── map/               PlanPin, ClusterPin, MapPreviewSheet, UserLocationDot
├── chat/              MessageBubble, SystemMessage, PinnedPlanBar,
│                      MessageComposer, ConversationRow
├── forms/             TextField, SearchField, CategoryGrid,
│                      TimeShortcutRow, LocationField, SeatsStepper,
│                      AppleGoogleSignInButton
└── feedback/          BottomSheet, Modal, Banner, Toast, EmptyState, Skeleton, ListSection

```

**Composant transverse critique — CORE MVP** : `AccountGateSheet` (regroupe les feuilles "ce qui manque" et `under_review` de Create Plan V1.3 §12 et Plan Detail V1.3 §13bis). **Un seul composant, invoqué depuis plusieurs points d'entrée** (bouton Créer, bouton Rejoindre) — ne jamais dupliquer cette logique par écran, exactement comme les specs l'exigent.

---

## 5. Data model complet

**CORE MVP**, sauf mention contraire. Vue d'ensemble avant le DDL exact (§6) :

| **TableRôle**        |                                                             |
| -------------------- | ----------------------------------------------------------- |
| `users`              | Compte, identité légère, statut                             |
| `cities`             | Référentiel de villes (Casablanca seule active en V1)       |
| `interests`          | Référentiel des tags d'intérêt                              |
| `user_interests`     | Liaison many-to-many                                        |
| `plans`              | Les plans publiés                                           |
| `plan_participants`  | Participation (pending/accepted/declined/cancelled/removed) |
| `messages`           | Messages de chat (texte uniquement)                         |
| `reports`            | Signalements                                                |
| `blocks`             | Blocages bilatéraux                                         |
| `notifications`      | Notifications transactionnelles                             |
| `moderation_actions` | Journal d'audit des décisions de modération                 |
| `behavior_signals`   | Signaux comportementaux bruts (Safety Layer §5)             |
| `app_config`         | Paramètres serveur ajustables sans redéploiement            |

---

## 6. Schéma PostgreSQL

**CORE MVP** — DDL exact, types Postgres natifs + PostGIS.

```sql
-- Extension requise
create extension if not exists postgis;
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ============ CITIES ============
create table cities (
  id           uuid primary key default gen_random_uuid(),
  cle          text unique not null,           -- 'casablanca'
  nom          text not null,                  -- 'Casablanca'
  actif        boolean not null default true,
  centre       geography(Point, 4326) not null,
  created_at   timestamptz not null default now()
);

-- ============ USERS ============
-- V1.3 : authentification Apple/Google exclusivement. Aucun champ de téléphone dans le schéma.
create table users (
  id                  uuid primary key default gen_random_uuid(), -- = auth.users.id
  auth_provider       text not null check (auth_provider in ('apple','google')),
  prenom              text check (char_length(prenom) between 2 and 30),   -- NULL tant que l'onboarding n'est pas complété
  date_naissance      date,                                                 -- idem
  ville_id            uuid references cities(id),                          -- idem
  bio                 text check (char_length(bio) <= 150),
  photo_url           text,                        -- NULL tant qu'aucune photo n'est uploadée
  locale              text not null default 'fr',  -- 'fr' | 'ar' | 'en' (i18n, Blueprint §5)
  account_status      text not null default 'active'
                        check (account_status in ('active','under_review','suspended','banned')),
  notifications_opt_in boolean not null default false,
  location_opt_in      boolean not null default false,
  device_id           text,                        -- signal non biométrique, §39
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Contrainte de majorité — nullable tant que la date n'est pas encore saisie, stricte dès qu'elle l'est
alter table users add constraint chk_users_majeure
  check (date_naissance is null or date_naissance <= (current_date - interval '18 years'));

create index idx_users_account_status on users(account_status);

-- ============ INTERESTS ============
create table interests (
  id     uuid primary key default gen_random_uuid(),
  cle    text unique not null,     -- 'cafe', 'brunch', ... (12 catégories, Blueprint §24)
  ordre  smallint not null
);

create table user_interests (
  user_id     uuid not null references users(id) on delete cascade,
  interest_id uuid not null references interests(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, interest_id)
);

-- ============ PLANS ============
create table plans (
  id                  uuid primary key default gen_random_uuid(),
  creator_id          uuid not null references users(id),
  categorie_cle       text not null,  -- FK logique vers un enum applicatif (12 catégories)
  titre               text not null check (char_length(titre) <= 60),
  description         text check (char_length(description) <= 200),
  lieu                geography(Point, 4326) not null,
  lieu_public         text not null,      -- nom du lieu ou point de repère + quartier
  quartier            text not null,
  adresse_exacte      text,               -- NULL tant que non renseignée ; RLS restreint sa lecture (§12)
  date_heure          timestamptz not null,
  places_max          smallint not null check (places_max between 2 and 20),
  participation_mode  text not null check (participation_mode in ('auto','request')),
  status              text not null default 'actif'
                        check (status in ('actif','complet','annule','passe')),
  city_id             uuid not null references cities(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint chk_plans_date_future check (date_heure >= created_at)
);

create index idx_plans_city_date on plans(city_id, date_heure);
create index idx_plans_creator on plans(creator_id);
create index idx_plans_status on plans(status);
create index idx_plans_lieu_gist on plans using gist (lieu);  -- PostGIS, §9
create index idx_plans_categorie on plans(categorie_cle);

-- ============ PLAN_PARTICIPANTS ============
create table plan_participants (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references plans(id) on delete cascade,
  user_id     uuid not null references users(id),
  status      text not null default 'pending'
                check (status in ('pending','accepted','declined','cancelled','removed')),
  created_at  timestamptz not null default now(),
  responded_at timestamptz,

  unique (plan_id, user_id)   -- une seule ligne de participation par personne et par plan
);

create index idx_pp_plan on plan_participants(plan_id);
create index idx_pp_user on plan_participants(user_id);
create index idx_pp_status on plan_participants(plan_id, status);

-- ============ MESSAGES ============
create table messages (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references plans(id) on delete cascade,
  sender_id   uuid references users(id),   -- NULL pour un message système
  contenu     text not null check (char_length(contenu) <= 1000),
  type        text not null default 'user' check (type in ('user','system')),
  created_at  timestamptz not null default now()
);

create index idx_messages_plan_created on messages(plan_id, created_at);

-- ============ REPORTS ============
create table reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references users(id),
  target_type  text not null check (target_type in ('user','plan','message')),
  target_id    uuid not null,
  motif        text not null check (motif in (
                  'contenu_inapproprie','harcelement','profil_suspect',
                  'probleme_securite','autre')),
  commentaire  text check (char_length(commentaire) <= 500),
  status       text not null default 'ouvert' check (status in ('ouvert','traite','rejete')),
  reviewed_by  uuid references users(id),   -- compte modérateur (rôle admin)
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index idx_reports_target on reports(target_type, target_id);
create index idx_reports_status on reports(status);

-- ============ BLOCKS ============
create table blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references users(id),
  blocked_id  uuid not null references users(id),
  created_at  timestamptz not null default now(),

  unique (blocker_id, blocked_id),
  constraint chk_blocks_not_self check (blocker_id <> blocked_id)
);

create index idx_blocks_blocker on blocks(blocker_id);
create index idx_blocks_blocked on blocks(blocked_id);

-- ============ NOTIFICATIONS ============
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  type        text not null,   -- 'join_request','request_accepted','new_participant',
                                 -- 'new_message','plan_reminder','plan_updated','moderation'
  payload     jsonb not null default '{}',
  lu          boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_unread on notifications(user_id, lu);

-- ============ MODERATION_ACTIONS (journal d'audit) ============
create table moderation_actions (
  id            uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references users(id),
  moderator_id  uuid references users(id),   -- NULL si action automatique (voir is_automatic)
  is_automatic  boolean not null default false,
  action        text not null check (action in (
                  'avertir','passer_under_review','reactiver','suspendre','bannir')),
  raison        text,
  created_at    timestamptz not null default now()
);

create index idx_moderation_target on moderation_actions(target_user_id);

-- ============ BEHAVIOR_SIGNALS (Safety Layer §5) ============
create table behavior_signals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  type_signal   text not null,  -- 'multi_account_device','high_velocity','excess_plans', ...
  valeur        jsonb not null default '{}',
  fenetre_debut timestamptz not null,
  fenetre_fin   timestamptz not null,
  created_at    timestamptz not null default now()
);

create index idx_behavior_user on behavior_signals(user_id, created_at);

-- ============ APP_CONFIG ============
create table app_config (
  cle          text primary key,
  valeur       jsonb not null,
  updated_at   timestamptz not null default now()
);

```

---

## 7. Relations entre tables

**CORE MVP** — Diagramme relationnel (texte) :

```
cities 1──∞ users (ville_id)
cities 1──∞ plans (city_id)
users 1──∞ plans (creator_id)
users ∞──∞ interests (via user_interests)
plans 1──∞ plan_participants
users 1──∞ plan_participants
plans 1──∞ messages
users 1──∞ messages (sender_id, nullable)
users 1──∞ reports (reporter_id)
users 1──∞ blocks (blocker_id) ; users 1──∞ blocks (blocked_id)
users 1──∞ notifications
users 1──∞ moderation_actions (target_user_id, moderator_id nullable)
users 1──∞ behavior_signals

```

Aucune relation directe `users ↔ users` de type "amis"/"following" — cohérent avec l'absence structurelle de graphe social (Blueprint §7.3).

---

## 8. Index et contraintes

**CORE MVP** — Déjà intégrés dans le DDL (§6). Résumé des contraintes les plus importantes à ne jamais relâcher :

| **ContrainteTableObjet**      |                    |                                                                                                                            |
| ----------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `chk_users_majeure`           | users              | Majorité 18+ imposée en base, pas seulement côté client                                                                    |
| `places_max between 2 and 20` | plans              | Capacité — **aucune valeur "illimité" possible**, contrainte SQL, pas seulement UI                                         |
| `unique(plan_id, user_id)`    | plan\_participants | Une seule ligne de participation par personne et par plan                                                                  |
| `chk_blocks_not_self`         | blocks             | Une utilisatrice ne peut pas se bloquer elle-même                                                                          |
| `account_status in (...)`     | users              | Exactement 4 valeurs, jamais une donnée de téléphone comme valeur stockée (Blueprint §6.3, révisé V1.3)                    |
| Index GIST sur `plans.lieu`   | plans              | Obligatoire pour les requêtes de proximité PostGIS (§9) — sans lui, `plans.discover` ferait un scan complet à chaque appel |

**Contrainte applicative, pas SQL — CORE MVP, imposée côté Edge Function** : maximum 3 plans `status = 'actif'` par `creator_id` (Blueprint §10.3, §20). Non modélisable proprement en contrainte SQL déclarative simple — implémentée comme vérification explicite dans `plans-create` (§13), doublée d'un **trigger de garde-fou** pour empêcher un contournement direct de la table :

```sql
create or replace function fn_check_max_active_plans()
returns trigger as $$
begin
  if (select count(*) from plans
      where creator_id = new.creator_id and status = 'actif') >= 3
  then
    raise exception 'max_active_plans_reached';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_max_active_plans
  before insert on plans
  for each row execute function fn_check_max_active_plans();

```

---

## 9. PostGIS / géolocalisation

**CORE MVP**

- Colonnes `geography(Point, 4326)` sur `cities.centre` et `plans.lieu` — SRID 4326 (WGS84), standard GPS.
- **Fonction de découverte élastique** (Blueprint §4.2), implémentée en RPC Postgres plutôt qu'en logique applicative répétée côté client :

```sql
create or replace function fn_discover_plans(
  p_lat double precision,
  p_lng double precision,
  p_city_id uuid,
  p_categorie text default null,
  p_max_results int default 30
)
returns table (plan_id uuid, distance_m double precision, palier int)
language plpgsql as $$
declare
  v_point geography := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;
  v_radii int[] := array[3000, 8000, 20000];  -- paliers en mètres, lus depuis app_config en pratique
  v_target int;
  r int;
begin
  select (valeur->>'volume_cible')::int into v_target from app_config where cle = 'discovery_target_volume';
  v_target := coalesce(v_target, 10);

  foreach r in array v_radii loop
    return query
      select p.id, ST_Distance(p.lieu, v_point), r
      from plans p
      where p.status = 'actif'
        and (p_categorie is null or p.categorie_cle = p_categorie)
        and ST_DWithin(p.lieu, v_point, r)
      order by ST_Distance(p.lieu, v_point)
      limit p_max_results;

    if (select count(*) from plans p
        where p.status = 'actif' and ST_DWithin(p.lieu, v_point, r)) >= v_target
    then
      return;
    end if;
  end loop;

  -- palier 4 : ville entière
  return query
    select p.id, ST_Distance(p.lieu, v_point), 0
    from plans p
    where p.status = 'actif' and p.city_id = p_city_id
      and (p_categorie is null or p.categorie_cle = p_categorie)
    order by p.date_heure
    limit p_max_results;
end;
$$;

```

**Important** : cette fonction retourne des **identifiants et des distances**, jamais une position d'utilisatrice stockée — la position GPS transmise en paramètre (`p_lat`, `p_lng`) n'est **jamais persistée en base**, cohérent avec Blueprint §15 point 3. Elle transite uniquement le temps de l'appel RPC.

- Résolution automatique du lieu à la création de plan (Create Plan V1.3 §6) : requête sur un référentiel de lieux/POI — **OPTIONNELLE en V1 stricte** si aucun fournisseur de POI n'est encore intégré : implémentable via une API de lieux tierce, appelée **côté serveur uniquement** depuis une Edge Function, jamais depuis le client pour ne pas exposer la clé API.

---

## 10. Supabase Auth / Sign in with Apple & Google

**CORE MVP.** Plus aucune dépendance à un provider SMS, plus d'OTP téléphone, **aucun champ de téléphone dans le schéma** (décision V1.3, voir §6).

- Supabase Auth en mode **OAuth** : `Sign in with Apple` (obligatoire sur iOS dès qu'une autre méthode de connexion tierce existe — règle App Store) et `Sign in with Google`.
- **Couverture iOS/Android, vérifiée contre l'implémentation réelle — point de correction technique de cette révision.** Apple ne fournit **aucun SDK natif pour Android** ; `expo-apple-authentication` n'est utilisable que sur iOS (bouton natif, Face ID/Touch ID). Le flow diffère donc par plateforme :
  - **iOS** : `expo-apple-authentication` → `credential.identityToken` → `supabase.auth.signInWithIdToken({ provider: 'apple', token })`. Natif, sans navigateur.
  - **Android (et tout appareil sans Apple Sign In natif)** : Supabase Auth expose le flow OAuth standard d'Apple (`supabase.auth.signInWithOAuth({ provider: 'apple' })`), qui ouvre une session web sécurisée (`expo-web-browser`) vers le point Apple "Sign in with Apple for the web" et revient dans l'app par redirection. C'est le flow officiellement recommandé par Apple lui-même pour d'autres OS que les siens (documenté côté Supabase comme "OAuth flow (web, ... Kotlin non-iOS platforms)"). Nécessite un Services ID Apple distinct de l'App ID, et le renouvellement du secret JWT Apple **tous les 6 mois** (obligation Apple, à planifier comme tâche récurrente d'exploitation, pas une implémentation ponctuelle).
  - **Google**, à l'inverse, dispose d'un SDK natif sur Android comme sur iOS : `expo-auth-session` / Google Sign-In SDK sur les deux plateformes, sans distinction de flow.
- Côté client, dans tous les cas : un jeton (`id_token` natif ou `access_token` du flow OAuth) est transmis à Supabase Auth, qui crée la session — aucun secret client exposé, aucun serveur intermédiaire nécessaire pour l'authentification elle-même au-delà de la configuration Supabase (Services ID, clé privée Apple stockée côté Supabase, jamais côté app).
- `auth.users` est créé nativement par Supabase Auth à la première connexion réussie, avec `raw_app_meta_data.provider` renseigné par Supabase (`apple` ou `google`), identique quel que soit le flow (natif iOS ou OAuth Android).
- Trigger de création du profil applicatif, simplifié :

```sql
create or replace function fn_handle_new_auth_user()
returns trigger as $$
declare
  v_provider text;
begin
  v_provider := new.raw_app_meta_data->>'provider';  -- 'apple' | 'google'
  insert into public.users (id, auth_provider)
  values (new.id, v_provider)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function fn_handle_new_auth_user();

```

- **Aucun rate limiting OTP à gérer** (n'existe plus) ; le rate limiting de connexion est celui, natif, d'Apple/Google eux-mêmes.
- **Blocage définitif d'un compte mineur** (âge < 18 à la soumission) : identique dans le principe, mais la clé de blocage n'est plus un numéro de téléphone — c'est l'identifiant `auth.users.id` (et, si Apple/Google le permettent, l'email associé au compte OAuth) qui est marqué comme bloqué, empêchant une nouvelle tentative de compléter l'onboarding avec le même compte Apple/Google. **Un compte mineur qui changerait de compte Apple/Google pourrait contourner ce blocage** — limite assumée, cohérente avec le fait qu'aucune pièce d'identité n'est demandée (Blueprint §6.1), et pas plus contournable qu'un ancien blocage par numéro ne l'était par un second numéro.

**Aucun numéro de téléphone n'est collecté, stocké ou déclaré pour le MVP.** Si un numéro devient pertinent un jour pour une fonctionnalité future, il sera ajouté par une migration dédiée à ce moment-là — le schéma actuel ne l'anticipe pas.

---

## 10bis. SMS Provider Decision — retirée, V1.2

**Cette section (§40 de la V1.1) est intégralement retirée.** L'authentification par téléphone + OTP est abandonnée ; aucun provider SMS n'est nécessaire, aucun coût récurrent de message par inscription. Le cadre de décision qui existait en §40 n'a plus d'objet et n'est pas remplacé — Apple/Google Sign-In ne nécessite aucune décision de provider tiers équivalente, l'authentification est entièrement gérée par Supabase Auth + les SDK natifs Apple/Google.

---

## 11. Storage et gestion des photos

**CORE MVP**

- **Un seul bucket** `avatars` (le bucket `verification` de l'ancienne architecture biométrique est supprimé, aucune trace dans cette architecture).
- Chemin de stockage : `avatars/{user_id}/profile.jpg`, un seul fichier actif par utilisatrice (écrasé au remplacement, cohérent avec "1 seule photo en V1").
- Policies Storage (RLS niveau bucket) :
  - **Lecture** : autorisée pour toute utilisatrice authentifiée dont le compte n'est pas bloqué par le propriétaire de la photo (délègue à la table `blocks`).
  - **Écriture** : uniquement le propriétaire du dossier (`auth.uid() = user_id` extrait du chemin).
- Redimensionnement/compression : traitement côté client avant upload (Expo Image Manipulator), pas de traitement serveur en V1 — **LATER** : transformation à la volée côté Storage si la bande passante devient un problème.
- **Modération de contenu de la photo (Safety Layer §10)** : **humaine et a posteriori** en V1 (signalement + échantillonnage manuel dans le backoffice), aucun filtre automatique — **LATER** : intégration d'un service tiers de modération d'image, hors périmètre MVP.

---

## 12. RLS policies

**CORE MVP** — Row Level Security activée sur **toutes les tables** dès la première migration. Extraits représentatifs :

```sql
alter table users enable row level security;
alter table plans enable row level security;
alter table plan_participants enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;
alter table blocks enable row level security;
alter table notifications enable row level security;
alter table moderation_actions enable row level security;
alter table behavior_signals enable row level security;

-- ===== USERS =====
create policy users_select_self on users for select
  using (auth.uid() = id);

-- Lecture d'un autre profil : uniquement depuis un contexte de plan (Blueprint §7.2)
create policy users_select_via_plan_context on users for select
  using (
    exists (
      select 1 from plan_participants pp1
      join plan_participants pp2 on pp1.plan_id = pp2.plan_id
      where pp1.user_id = auth.uid() and pp1.status = 'accepted'
        and pp2.user_id = users.id
    )
    or exists (
      select 1 from plans p
      where p.creator_id = users.id
        and exists (select 1 from plan_participants pp
                     where pp.plan_id = p.id and pp.user_id = auth.uid())
    )
    and not exists (  -- exclusion des comptes bloqués, dans les deux sens
      select 1 from blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = users.id)
         or (b.blocker_id = users.id and b.blocked_id = auth.uid())
    )
  );

create policy users_update_self on users for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- ===== PLANS =====
create policy plans_select_discover on plans for select
  using (
    status = 'actif'
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = plans.creator_id)
         or (b.blocker_id = plans.creator_id and b.blocked_id = auth.uid())
    )
  );

-- Création : condition d'accès complète (réarchitecturée V1.2, sans téléphone), vérifiée en RLS
create policy plans_insert_if_ready on plans for insert
  with check (
    auth.uid() = creator_id
    and exists (
      select 1 from users u
      where u.id = auth.uid()
        and u.prenom is not null
        and u.date_naissance is not null
        and u.ville_id is not null
        and u.photo_url is not null
        and u.account_status = 'active'
    )
  );

create policy plans_update_own on plans for update
  using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- ===== ADRESSE EXACTE — vues dédiées pour appliquer la règle 15.1 =====
create view plans_public as
  select id, creator_id, categorie_cle, titre, description, lieu, lieu_public,
         quartier, date_heure, places_max, participation_mode, status, city_id
  -- adresse_exacte volontairement absente de cette vue
  from plans;

create view plans_full as
  select p.* from plans p
  where p.creator_id = auth.uid()
     or exists (select 1 from plan_participants pp
                where pp.plan_id = p.id and pp.user_id = auth.uid() and pp.status = 'accepted');
-- l'app interroge plans_public par défaut, plans_full uniquement après acceptation

-- ===== PLAN_PARTICIPANTS =====
create policy pp_select on plan_participants for select
  using (
    user_id = auth.uid()
    or exists (select 1 from plans p where p.id = plan_id and p.creator_id = auth.uid())
  );

create policy pp_insert_if_ready on plan_participants for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from users u
      where u.id = auth.uid()
        and u.prenom is not null
        and u.date_naissance is not null
        and u.ville_id is not null
        and u.photo_url is not null
        and u.account_status = 'active'   -- exclut under_review, suspended, banned
    )
  );

-- ===== MESSAGES =====
create policy messages_select on messages for select
  using (
    exists (select 1 from plans p where p.id = plan_id and p.creator_id = auth.uid())
    or exists (select 1 from plan_participants pp
               where pp.plan_id = messages.plan_id and pp.user_id = auth.uid()
                     and pp.status = 'accepted')
  );

create policy messages_insert on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (select 1 from users u where u.id = auth.uid() and u.account_status = 'active')
    and exists (select 1 from plans p where p.id = plan_id and p.status in ('actif','complet'))
    and (
      exists (select 1 from plans p where p.id = plan_id and p.creator_id = auth.uid())
      or exists (select 1 from plan_participants pp
                 where pp.plan_id = messages.plan_id and pp.user_id = auth.uid()
                       and pp.status = 'accepted')
    )
  );

-- ===== BLOCKS / REPORTS =====
create policy blocks_select_own on blocks for select using (blocker_id = auth.uid());
create policy blocks_insert_own on blocks for insert with check (blocker_id = auth.uid());
create policy reports_insert_own on reports for insert with check (reporter_id = auth.uid());
create policy reports_select_own on reports for select using (reporter_id = auth.uid());

-- ===== NOTIFICATIONS =====
create policy notifications_select_own on notifications for select using (user_id = auth.uid());
create policy notifications_update_own on notifications for update using (user_id = auth.uid());

-- ===== MODERATION (rôle admin uniquement, via un claim JWT dédié) =====
create policy moderation_admin_all on moderation_actions for all
  using (auth.jwt() ->> 'role' = 'admin');
create policy reports_admin_all on reports for all
  using (auth.jwt() ->> 'role' = 'admin');

```

**Point d'architecture critique — la règle 15.1 (adresse exacte) est appliquée par deux vues distinctes (****`plans_public`**** / ****`plans_full`****), jamais par un filtrage côté client.** C'est la traduction technique directe de "jamais par masquage côté client" (Blueprint §15.1).

**Le blocage ****`under_review`**** sur Create/Join (Blueprint §6.4bis) est vérifié en RLS ET en Edge Function** (redondance volontaire — la RLS est la barrière réelle, l'Edge Function ne fait que donner un message d'erreur exploitable côté UI avant l'échec RLS brut).

---

## 13. Edge Functions

**CORE MVP** sauf mention. Toutes en Deno/TypeScript, invoquées via `supabase.functions.invoke()`.

| **FonctionEntréeSortieRôle**  |                                                           |                           |                                                                                                                                                         |
| ----------------------------- | --------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onboarding-complete-profile` | prenom, date\_naissance, ville\_id, bio?, interests[]?    | user                      | Finalise le profil après Sign in with Apple/Google ; applique la contrainte de majorité et bloque le compte (auth.users.id) associé si échec — voir §10 |
| `profile-upload-photo`        | fichier image                                             | photo\_url                | Upload vers `avatars`, invalide l'ancienne photo                                                                                                        |
| `plans-create`                | catégorie, titre, heure, lieu, places, mode, description? | plan                      | Revérifie la condition d'accès + limite de 3 plans actifs ; crée le plan et son canal de chat                                                           |
| `plans-discover`              | lat, lng, city\_id, catégorie?                            | liste de plans + palier   | Enveloppe `fn_discover_plans` (§9), applique le format de réponse Home/Carte                                                                            |
| `plans-update-capacity`       | plan\_id, nouvelle\_capacite                              | plan                      | Réservé à la créatrice ; refuse si `nouvelle_capacite < count(accepted)`                                                                                |
| `plans-update-location-time`  | plan\_id, nouveaux champs                                 | plan                      | Réservé à la créatrice ; message système + notifications                                                                                                |
| `plan-cancel`                 | plan\_id                                                  | ok                        | Réservé à la créatrice ; statut → `annule`, message système, notifications                                                                              |
| `participation-join`          | plan\_id                                                  | statut (accepted/pending) | Vérifie condition d'accès, blocage, places disponibles ; insère la ligne `plan_participants`                                                            |
| `participation-respond`       | plan\_participant\_id, decision (accept/decline)          | statut                    | Réservé à la créatrice ; contrôle le nombre de places restantes                                                                                         |
| `participation-leave`         | plan\_participant\_id                                     | ok                        | Libère la place, retire l'accès au chat                                                                                                                 |
| `reports-create`              | target\_type, target\_id, motif, commentaire?             | report                    | Insère + déclenche `fn_check_report_threshold` (§17)                                                                                                    |
| `blocks-create`               | blocked\_id                                               | ok                        | Insère le blocage ; si `blocked_id` est la créatrice d'un plan que j'ai rejoint ou l'inverse, retire la participation (Plan Chat §8)                    |
| `moderation-action`           | target\_user\_id, action, raison?                         | ok                        | **Rôle admin uniquement** ; met à jour `account_status`, journalise dans `moderation_actions`                                                           |
| `notifications-dispatch`      | déclenché par trigger DB, pas d'appel direct              | —                         | Construit le payload et appelle Expo Push (§15)                                                                                                         |
| `account-delete`              | —                                                         | ok                        | Supprime photo, données de profil, `auth.users` associé (Apple/Google) ; conforme à Safety Layer §13                                                    |

**LATER** : `moderation-auto-flag` (signaux comportementaux forts → passage automatique `under_review`, Safety Layer §7 voie C) — implémentable en V1 mais listée LATER par prudence sur le calibrage des seuils avant un premier passage en production.

---

## 14. Realtime / chat

**CORE MVP**

- Un **canal Supabase Realtime par plan** : `plan:{plan_id}`, souscription à la table `messages` filtrée par `plan_id`.
- Autorisation du canal déléguée à la RLS de `messages` (§12) — Supabase Realtime respecte nativement les policies RLS sur les tables répliquées.
- **Envoi optimiste côté client** (Plan Group Chat V1 §20 Décision 1) : le message est inséré localement en état `sending`, puis confirmé/rejeté selon la réponse de l'insert Postgres — comportement purement client, aucune logique serveur supplémentaire nécessaire.
- **Archivage automatique 24h après ****`date_heure`** : job planifié (`pg_cron` sur Supabase, ou Edge Function déclenchée par un scheduler externe) qui passe `plans.status = 'passe'`. L'insert de nouveaux messages est bloqué dès que le statut change, via la clause déjà intégrée à `messages_insert` (§12 : `status in ('actif','complet')`).

---

## 15. Notifications

**CORE MVP**

- Expo Push Notification Service, token stocké dans une colonne `push_token` sur `users` (voir correction listée en audit final).
- Déclenchement **par trigger Postgres** sur les tables sources, jamais par polling :

```sql
create or replace function fn_notify_on_new_participant()
returns trigger as $$
begin
  if new.status = 'accepted' then
    insert into notifications (user_id, type, payload)
    select creator_id, 'new_participant', jsonb_build_object('plan_id', new.plan_id, 'participant_id', new.user_id)
    from plans where id = new.plan_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_new_participant
  after insert or update on plan_participants
  for each row execute function fn_notify_on_new_participant();

```

Triggers équivalents pour : `join_request` (nouvelle ligne `pending`), `request_accepted`/`request_declined`, `new_message` (avec regroupement, Plan Chat §12), `plan_reminder` (job planifié 1h avant `date_heure`), `plan_updated`, `moderation`. L'insertion dans `notifications` déclenche ensuite l'appel à `notifications-dispatch` (via `pg_net` ou un listener applicatif) qui construit le push effectif.

- **Regroupement des notifications de messages** (Plan Chat §12) : logique de fenêtre glissante côté `notifications-dispatch` (ne pas envoyer un push par message si plusieurs arrivent en moins de X secondes — regrouper en "3 nouveaux messages").

---

## 16. Plans / participants / demandes / capacité

**CORE MVP** — Résumé technique de la mécanique déjà couverte par le schéma (§6) et les Edge Functions (§13) :

| **Règle produitImplémentation**                 |                                                                                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Capacité 2-20, défaut 4                         | `check` SQL sur `plans.places_max`                                                                                                                     |
| Créatrice modifie la capacité après publication | `plans-update-capacity`, refuse si incohérent avec les participantes déjà acceptées                                                                    |
| Plan complet → `Complet`                        | Calculé côté lecture : `count(accepted) >= places_max`, pas un champ stocké redondant                                                                  |
| Demande expire à l'heure du plan                | Job planifié : `update plan_participants set status='declined' where status='pending' and plan_id in (select id from plans where date_heure <= now())` |
| Max 3 plans actifs                              | Trigger `fn_check_max_active_plans` (§8)                                                                                                               |
| Liste d'attente                                 | **REMOVE explicite du MVP** (Blueprint §3.5) — aucune table ni statut ne la modélise                                                                   |

---

## 17. Account status / moderation

**CORE MVP** — Reprend Safety Layer V1 §7 exactement :

```sql
-- Voie B : plusieurs signalements distincts et cohérents → under_review automatique
create or replace function fn_check_report_threshold()
returns trigger as $$
declare
  v_threshold int;
  v_count int;
begin
  select (valeur->>'seuil')::int into v_threshold from app_config where cle = 'report_threshold_under_review';
  v_threshold := coalesce(v_threshold, 3);

  select count(distinct reporter_id) into v_count
  from reports
  where target_type = 'user' and target_id = new.target_id
    and created_at > now() - interval '7 days';

  if v_count >= v_threshold then
    update users set account_status = 'under_review' where id = new.target_id and account_status = 'active';
    insert into moderation_actions (target_user_id, moderator_id, is_automatic, action, raison)
    values (new.target_id, null, true, 'passer_under_review', 'seuil de signalements atteint (automatique)');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_check_report_threshold
  after insert on reports
  for each row when (new.target_type = 'user')
  execute function fn_check_report_threshold();

```

**Décision d'implémentation, alignée sur Safety Layer §7** : un signalement isolé (voie A) n'exécute **aucune action** au-delà de l'insertion. Le passage `under_review` déclenche mécaniquement, via les RLS déjà décrites (§12), le blocage de Create/Join/Chat — **aucune logique de blocage supplémentaire à écrire ailleurs**, c'est la RLS qui porte la règle, une seule fois.

---

## 18. Safety Layer technique

**CORE MVP** — Table `behavior_signals` (§6) alimentée par des vérifications applicatives dans les Edge Functions concernées :

### Barrière d'entrée — remplacement du rôle du téléphone confirmé, réarchitecturé V1.2

Le téléphone confirmé ne peut plus être présenté comme une barrière d'entrée (il n'existe plus). Le mécanisme non téléphonique minimal qui reprend ce rôle, **sans biométrie ni vérification de genre** :

1. **Compte authentifié via un fournisseur d'identité réel (Apple ou Google)** — remplace la friction qu'apportait un numéro de téléphone valide. Créer un compte Apple ou Google en masse a son propre coût et sa propre friction (ces plateformes appliquent déjà leurs propres limites anti-abus), ce qui reproduit fonctionnellement le rôle du téléphone sans que SHEGO ait besoin de le vérifier elle-même. **Ce n'est ni une vérification d'identité, ni une preuve de genre** — c'est une barrière d'accès réelle, au même titre que l'était le téléphone, ni plus ni moins.
2. **Photo de profil obligatoire** — inchangée, rôle identique à avant (Blueprint §6.2).
3. **Signal ****`device_id`** (§39) — inchangé, détecte les créations multiples de compte depuis un même appareil, indépendamment du fournisseur d'authentification utilisé.
4. **Signalement + modération humaine** — inchangés, dernière ligne de défense réelle (Safety Layer §11).

**Ce qui n'est pas ajouté pour compenser la perte du téléphone** : aucun trust score public, aucune vérification de genre, aucune reconnaissance faciale, aucun document officiel, aucune biométrie — cohérent avec l'interdiction explicite de cette révision, identique à celle déjà verrouillée pour le reste du produit.

### Signaux comportementaux

| **SignalOù il est détecté**                 |                                                                                                                                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Créations de compte multiples (même device) | `onboarding-complete-profile`, comparaison d'un identifiant de device non biométrique sur une fenêtre de 24h — **indépendant du fournisseur d'auth**, fonctionne identiquement pour Apple et Google |
| Vitesse anormale d'actions                  | Vérification simple de `created_at` du compte vs nombre d'actions déjà réalisées, dans chaque Edge Function sensible                                                                                |
| Création excessive de plans                 | Déjà couvert par le trigger `fn_check_max_active_plans` (§8)                                                                                                                                        |
| Volume de messages anormal                  | Job périodique de comptage sur `messages` par `sender_id` / fenêtre glissante                                                                                                                       |
| Signaux forts → `under_review` automatique  | **LATER** (Safety Layer §7 voie C) : `moderation-auto-flag`, non activée au lancement, seuils à calibrer avec des données réelles avant activation                                                  |

**Aucun traitement d'image, aucune reconnaissance faciale, aucune estimation de genre — vérifié : rien dans ce document n'introduit de dépendance à un service de vision par ordinateur.**

---

## 19. Reports / blocks

**CORE MVP** — Déjà couvert par le schéma (§6), les RLS (§12) et le trigger de seuil (§17). Complément :

```sql
-- Blocage impliquant la créatrice : retrait automatique du plan (Plan Chat V1 §8, décision corrigée)
create or replace function fn_handle_block_creator_relation()
returns trigger as $$
begin
  update plan_participants pp
  set status = 'removed'
  from plans p
  where pp.plan_id = p.id
    and (
      (p.creator_id = new.blocker_id and pp.user_id = new.blocked_id)
      or (p.creator_id = new.blocked_id and pp.user_id = new.blocker_id)
    )
    and pp.status = 'accepted';
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_block_creator_relation
  after insert on blocks
  for each row execute function fn_handle_block_creator_relation();

```

**Blocage entre simples participantes (pas la créatrice)** : aucune ligne `plan_participants` n'est modifiée — le masquage se fait uniquement en lecture, via les RLS de `messages` et `users` déjà décrites (§12), cohérent avec Plan Chat V1 §8 corrigé ("reste membre du plan pour les autres, masquée uniquement pour la personne qui bloque").

---

## 20. Behavioral signals si nécessaires

**LATER dans son ensemble** (moteur de scoring, seuils calibrés), **CORE MVP pour la collecte brute** — voir §18. La distinction : on collecte dès le lancement (les données servent à calibrer les seuils), mais on n'active **aucune réaction automatique forte** avant d'avoir des données réelles de la beta (cohérent avec Safety Layer §5 et avec le refus explicite d'un trust score visible, Safety Layer §8).

---

## 21. API / services côté app

**CORE MVP** — Couche `src/services/`, un fichier par domaine, chacun exposant des fonctions typées qui encapsulent `supabase.from()` / `supabase.functions.invoke()` / `supabase.channel()`. Aucun composant n'importe `supabase` directement.

```
services/
├── auth.service.ts        signInWithApple, signInWithGoogle, signOut
├── profile.service.ts      getMe, updateProfile, uploadPhoto, deleteAccount
├── plans.service.ts        discoverPlans, getPlan, createPlan, cancelPlan, updateCapacity, updateLocationTime
├── participation.service.ts joinPlan, respondToRequest, leavePlan
├── chat.service.ts          subscribeToPlanChat, sendMessage, getMessages
├── reports.service.ts       reportEntity
├── blocks.service.ts        blockUser, unblockUser, listBlocked
├── notifications.service.ts registerPushToken, listNotifications, markRead
└── moderation.service.ts    (backoffice uniquement) listReports, applyAction

```

Chaque fonction retourne un type discriminé `{ data } | { error }`, jamais d'exception non gérée qui remonterait jusqu'à l'UI sans passage par la gestion d'erreurs (§23).

---

## 22. Gestion des permissions

**CORE MVP** — Reprend Onboarding V1.3 §6 et Design System §14 :

| **PermissionModule ExpoMoment de la demandeComportement si refusée** |                                     |                                                                              |                                                                                   |
| -------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Notifications                                                        | `expo-notifications`                | Écran 10 (Onboarding V1.3), après explication maison                         | Compte utilisable, `notifications_opt_in = false`, aucune relance intrusive en V1 |
| Localisation                                                         | `expo-location`                     | Écran 11 (Onboarding V1.3), après explication maison                         | Home en mode "ville entière", `location_opt_in = false`                           |
| Caméra                                                               | `expo-image-picker` (camera)        | Au tap sur "Prendre une photo" (écran 7, Onboarding V1.3), aucun écran dédié | Repli automatique sur "Choisir dans la galerie"                                   |
| Photothèque                                                          | `expo-image-picker` (media library) | Au tap sur "Choisir dans la galerie"                                         | Message système standard si refusée                                               |

**Aucune permission n'est demandée en groupe** — chaque appel est isolé dans son propre hook (`useNotificationPermission`, `useLocationPermission`), jamais un écran générique "Autoriser toutes les permissions".

---

## 23. Gestion des erreurs

**CORE MVP**

- Toutes les Edge Functions retournent un corps JSON structuré : `{ error: { code, message } }` avec des codes stables (`account_not_ready`, `under_review`, `max_active_plans`, `plan_full`, `already_blocked`, ...) — jamais de message d'erreur Postgres brut exposé au client.
- Mapping `code → texte UI` centralisé dans `src/i18n/errors.ts`, ce qui permet de respecter exactement les formulations LOCKED (ex. *"Ajoute une photo pour pouvoir créer ou rejoindre un plan."*) sans dupliquer le texte dans chaque écran.
- Erreurs réseau (timeout, offline) traitées séparément des erreurs métier — voir §24.

---

## 24. États offline / loading

**CORE MVP**

- Cache local léger (React Query ou équivalent) pour la Home et Mes Plans : dernière liste connue servie immédiatement, rafraîchie en arrière-plan.
- Bannière "Pas de connexion. On réessaie automatiquement." pilotée par `NetInfo` (Expo), pas par l'échec d'une requête isolée.
- Chat : messages envoyés hors ligne restent en état `sending` prolongé, retentative automatique à la reconnexion via une file locale simple (**LATER** : queue persistante complexe si le besoin réel apparaît en beta).
- Skeletons pour tout chargement initial > 200ms, jamais de spinner plein écran pour un rafraîchissement de liste déjà peuplée.

---

## 25. Variables d'environnement

**CORE MVP**

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # jamais exposée au client, Edge Functions uniquement
APPLE_SERVICES_ID=                 # Sign in with Apple, configuré côté Supabase Auth
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=                 # jamais exposée au client, config Supabase Auth uniquement
GOOGLE_CLIENT_ID_IOS=
GOOGLE_CLIENT_ID_ANDROID=
GOOGLE_CLIENT_ID_WEB=               # requis par Supabase Auth pour valider l'id_token Google
EXPO_PUBLIC_APP_ENV=                # 'development' | 'staging' | 'production'
PLACES_API_KEY=                     # si résolution automatique de lieu activée (§9), serveur uniquement

```

**Supprimées en V1.2** : `SMS_PROVIDER_API_KEY` et toute variable liée à un provider SMS — n'existent plus, aucune dépendance de ce type dans l'architecture.

**Aucune clé de service tiers biométrique** — vérifié, cohérent avec l'absence totale de ce type de dépendance dans toute l'architecture.

---

## 26. Environnements dev / staging / production

**CORE MVP**

| **EnvironnementProjet SupabaseUsage** |                                        |                                                                       |
| ------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| dev                                   | Projet dédié, données de seed fictives | Développement local, migrations testées en premier                    |
| staging                               | Projet séparé, miroir de prod          | Beta fermée Casablanca (Blueprint §29 phase 8), tests E2E automatisés |
| production                            | Projet séparé, accès restreint         | Utilisatrices réelles                                                 |

Migrations appliquées dans cet ordre strict via CLI Supabase, jamais de modification manuelle en staging/production hors migration versionnée.

---

## 27. GitHub / branches / workflow

**CORE MVP**

- `main` : toujours déployable, protégée, revue obligatoire.
- `develop` : intégration continue, base des branches de fonctionnalité.
- `feature/*` : une branche par écran ou domaine.
- CI GitHub Actions : lint + typecheck + tests unitaires (§28) à chaque PR ; migrations SQL validées avant merge sur `develop`.
- Déploiement staging automatique sur merge dans `develop` ; production sur tag versionné depuis `main`.

---

## 28. Tests unitaires

**CORE MVP** — Jest + React Native Testing Library.

- Logique de condition d'accès (`useAccountReady`) : les combinaisons de (profil complet — prénom/date/ville, photo, statut de compte).
- Résolution des raccourcis d'heure (Create Plan §5) : "Maintenant", "Dans 1h", "Ce soir" (disparition après 18h), "Demain".
- Défaut contextuel de mode par catégorie (Blueprint §3.2) : les 12 catégories.
- Formatage des messages d'erreur "ce qui manque" : jamais de message générique quand une condition précise est identifiable.
- Calcul d'âge depuis la date de naissance, cas limites (anniversaire le jour même).

---

## 29. Tests d'intégration

**CORE MVP** — Contre une instance Supabase locale, pas de mock de la base :

- RLS : vérifier qu'une utilisatrice `under_review` ne peut ni insérer dans `plans`, ni dans `plan_participants`, ni dans `messages`.
- Vue `plans_public` vs `plans_full` : vérifier qu'`adresse_exacte` n'est jamais lisible avant acceptation.
- Trigger de seuil de signalement → passage `under_review` automatique.
- Trigger de blocage impliquant la créatrice → retrait de participation.
- `fn_discover_plans` : vérifier la progression des paliers avec un jeu de données synthétique à densité contrôlée.

---

## 30. Tests E2E

**CORE MVP** — Maestro (YAML déclaratif, simple à maintenir) :

- Parcours complet Onboarding (11 écrans, Sign in with Apple **et** Sign in with Google testés séparément) jusqu'à l'arrivée sur Home.
- Boucle complète DISCOVER → CREATE → JOIN → CHAT sur deux comptes de test distincts.
- Refus de permission (notifications, localisation) → vérifier qu'aucun blocage n'en résulte.
- Compte `under_review` (injecté directement en base de test) → vérifier le blocage des 3 actions et le contenu exact des messages affichés.

**LATER** : couverture E2E multi-device (RTL arabe une fois la langue activée), tests de charge sur `fn_discover_plans`.

---

## 31. Sécurité

**CORE MVP**

- RLS activée sur 100% des tables, aucune exception.
- `SUPABASE_SERVICE_ROLE_KEY` jamais exposée côté client.
- Toute condition d'accès sensible (compte prêt, `under_review`, blocage, limite de 3 plans) est vérifiée côté serveur, jamais seulement côté client.
- Aucune donnée biométrique, aucune clé de service de reconnaissance faciale — vérifié à chaque section de ce document.
- Filtre lexical basique sur `plans.titre`, `plans.description`, `users.bio` (Blueprint §17) : liste de mots interdits appliquée côté Edge Function avant insertion.
- Chiffrement au repos : géré nativement par Supabase — aucune action supplémentaire requise pour le MVP.

---

## 32. Logging / monitoring

**CORE MVP**

- Logs applicatifs des Edge Functions captés par le dashboard Supabase.
- Journal d'audit `moderation_actions` — traçabilité exigée par Blueprint §17.
- Alerting minimal sur erreurs 5xx répétées (**OPTIONNELLE**, selon ressources disponibles avant lancement).
- **LATER** : Sentry (crashs client), PostHog ou équivalent (métriques d'usage alignées sur Blueprint §30) — recommandé avant l'ouverture publique, non requis pour la beta fermée.

---

## 33. Déploiement EAS

**CORE MVP**

- `eas build` pour iOS et Android, profils `development` / `preview` (staging) / `production`.
- `eas submit` pour la soumission automatisée.
- `eas update` (OTA) pour les correctifs non natifs — jamais utilisé pour contourner une revue de sécurité substantielle.

---

## 34. Préparation App Store / Google Play

**CORE MVP**

- Fiche produit : reprend le positionnement du Blueprint §6.5 exactement — jamais une formulation impliquant une vérification d'identité, y compris dans les captures d'écran (à vérifier explicitement avant soumission, ce n'est pas automatique).
- Politique de confidentialité publique : cohérente avec Safety Layer §13-14 — **document juridique séparé, hors périmètre technique, à produire avant soumission**.
- Déclaration Apple "App Privacy" : identifiant Apple/Google (contact info via l'authentification), photo de profil (photos), localisation approximative. Aucune donnée "santé", "biométrie" ou "téléphone" à déclarer — aucun champ de ce type n'existe dans le schéma V1.3.
- Classification d'âge : 18+, à déclarer explicitement sur les deux stores.

---

## 35. Ordre recommandé d'implémentation

**CORE MVP**

1. **Fondations** — Repo, projet Expo, projet Supabase (dev), migrations §6 complètes, RLS §12 dès la première migration, design tokens.
2. **Auth + Onboarding** — Sign in with Apple/Google, trigger de création de compte, les 11 écrans, `onboarding-complete-profile`, upload photo.
3. **Discover + Create** — `fn_discover_plans`, Home (liste), `plans-create`, condition d'accès complète testée.
4. **Join + Chat** — `participation-*`, Realtime, archivage automatique.
5. **Carte** — Vue carte, clustering côté client, mêmes données que la liste.
6. **Sécurité & Modération** — Reports, blocks, trigger de seuil, backoffice minimal, `account-delete`.
7. **Notifications** — Triggers + dispatch, regroupement.
8. **Polish, offline, accessibilité, tests E2E complets.**
9. **Beta fermée Casablanca** (staging → production progressive).

---

## 36. MVP vs LATER — tableau de synthèse

| **ÉlémentStatut**                                         |                                                                                                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth Apple/Google, RLS complète, schéma §6                | **CORE MVP**                                                                                                                                                |
| Découverte élastique (`fn_discover_plans`)                | **CORE MVP**                                                                                                                                                |
| Création de plan, condition d'accès serveur               | **CORE MVP**                                                                                                                                                |
| Join/Request, archivage chat 24h                          | **CORE MVP**                                                                                                                                                |
| Reports/blocks, seuil `under_review` automatique (voie B) | **CORE MVP**                                                                                                                                                |
| Collecte de signaux comportementaux bruts                 | **CORE MVP**                                                                                                                                                |
| Réaction automatique forte sur signaux (voie C)           | **LATER**                                                                                                                                                   |
| Modération de contenu automatique de la photo             | **LATER**                                                                                                                                                   |
| Résolution automatique de lieu via API tierce             | **OPTIONNELLE** — sinon fallback manuel/quartier                                                                                                            |
| Multi-device push token                                   | **OPTIONNELLE**                                                                                                                                             |
| i18n arabe/anglais activée                                | **LATER** (architecture prête, non peuplée)                                                                                                                 |
| Numéro de téléphone (tout usage)                          | **Absent du MVP, y compris comme champ optionnel** — aucune donnée de ce type collectée, stockée ou déclarée ; ajout futur = migration dédiée, pas anticipé |
| Monitoring produit dédié (Sentry/PostHog)                 | **LATER**, recommandée avant ouverture publique                                                                                                             |
| File de retry offline persistante pour le chat            | **LATER**                                                                                                                                                   |
| Empreinte de récidive post-suppression                    | **Explicitement absente du MVP** (Safety Layer §9), LATER sous validation juridique                                                                         |

---

## 37. Contrat des payloads de notification — fermeture décision 1

**CORE MVP** — Schéma JSON exact par `type`, stocké tel quel dans `notifications.payload` (jsonb). Le client désérialise selon `type`, jamais de champ ambigu ou optionnel non documenté.

```ts
type NotificationPayload =
  | { type: 'join_request'; plan_id: string; plan_titre: string; requester_id: string; requester_prenom: string }
  | { type: 'request_accepted'; plan_id: string; plan_titre: string }
  | { type: 'request_declined'; plan_id: string; plan_titre: string }
  | { type: 'new_participant'; plan_id: string; plan_titre: string; participant_id: string; participant_prenom: string }
  | { type: 'new_message'; plan_id: string; plan_titre: string; sender_id: string; sender_prenom: string; preview: string; grouped_count?: number }
  | { type: 'plan_reminder'; plan_id: string; plan_titre: string; date_heure: string; lieu_public: string }
  | { type: 'plan_updated'; plan_id: string; plan_titre: string; champ_modifie: 'lieu' | 'date_heure'; }
  | { type: 'moderation'; account_status: 'under_review' | 'suspended' | 'banned' | 'active' };

```

Règles associées :

| **TypeDéclencheur DBChamps garantisRemarque** |                                                           |                                                                       |                                                                                                                                                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `join_request`                                | Insert `plan_participants` (status='pending')             | plan\_id, plan\_titre, requester\_id, requester\_prenom               | Reçu uniquement par la créatrice                                                                                                                                                                                                |
| `request_accepted`                            | Update `plan_participants` (pending→accepted)             | plan\_id, plan\_titre                                                 | Reçu par la demandeuse                                                                                                                                                                                                          |
| `request_declined`                            | Update `plan_participants` (pending→declined)             | plan\_id, plan\_titre                                                 | Formulation neutre côté UI (Blueprint §3.6 — refus silencieux sur le motif)                                                                                                                                                     |
| `new_participant`                             | Insert `plan_participants` (status='accepted', mode auto) | plan\_id, plan\_titre, participant\_id, participant\_prenom           | Reçu uniquement par la créatrice                                                                                                                                                                                                |
| `new_message`                                 | Insert `messages` (type='user')                           | plan\_id, plan\_titre, sender\_id, sender\_prenom, preview (≤80 car.) | `grouped_count` ajouté par `notifications-dispatch` si regroupement (Plan Chat §12), jamais par le trigger DB lui-même                                                                                                          |
| `plan_reminder`                               | Job planifié (§38)                                        | plan\_id, plan\_titre, date\_heure, lieu\_public                      | **Jamais ****`adresse_exacte`** dans le payload, même pour une participante acceptée — la notification renvoie vers l'app, elle ne doit pas dupliquer une donnée sensible dans un système de notification tiers (Expo/APNs/FCM) |
| `plan_updated`                                | Update `plans` (lieu ou date\_heure)                      | plan\_id, plan\_titre, champ\_modifie                                 | Le contenu précis du changement n'est jamais dans le payload push — seulement "quelque chose a changé", le détail se lit dans l'app                                                                                             |
| `moderation`                                  | Update `users.account_status`                             | account\_status                                                       | Payload minimal à dessein — le texte affiché suit strictement le vocabulaire LOCKED (Safety Layer §11), jamais généré dynamiquement depuis le payload                                                                           |

**Principe transverse, nouveau en V1.1** : **aucun payload de notification ne contient ****`adresse_exacte`**** ni aucune donnée couverte par la règle 15.1.** Une notification push transite par des systèmes tiers (Expo, APNs, FCM) hors du périmètre de contrôle RLS — l'y faire transiter reviendrait à contourner la règle par un canal annexe. Ce principe est ajouté comme contrainte de conception, pas comme changement de la règle produit elle-même.

---

## 38. Scheduler — stratégie MVP pour les tâches planifiées — fermeture décision 3

**CORE MVP** — Trois tâches planifiées identifiées dans les specs LOCKED :

| **TâcheFréquenceSource de règle**                        |                       |                                   |
| -------------------------------------------------------- | --------------------- | --------------------------------- |
| Expiration des demandes `pending` à l'heure du plan      | Toutes les 5 minutes  | Blueprint §3.6                    |
| Passage `plans.status` → `passe`, 24h après `date_heure` | Toutes les 15 minutes | Blueprint §12 (archivage du chat) |
| `plan_reminder`, 1h avant `date_heure`                   | Toutes les 5 minutes  | Blueprint §14                     |

### Stratégie primaire — si `pg_cron` est disponible

`pg_cron` est une extension Postgres, activable sur les plans Supabase qui l'exposent (à vérifier dès la création du projet, §39-lié). Si disponible :

```sql
select cron.schedule('expire-pending-requests', '*/5 * * * *', $$
  update plan_participants set status = 'declined'
  where status = 'pending' and plan_id in (select id from plans where date_heure <= now());
$$);

select cron.schedule('archive-past-plans', '*/15 * * * *', $$
  update plans set status = 'passe'
  where status in ('actif','complet') and date_heure <= now() - interval '24 hours';
$$);

select cron.schedule('dispatch-plan-reminders', '*/5 * * * *', $$
  insert into notifications (user_id, type, payload)
  select pp.user_id, 'plan_reminder',
         jsonb_build_object('type','plan_reminder','plan_id',p.id,'plan_titre',p.titre,
                             'date_heure',p.date_heure,'lieu_public',p.lieu_public)
  from plans p
  join plan_participants pp on pp.plan_id = p.id and pp.status = 'accepted'
  where p.date_heure between now() + interval '55 minutes' and now() + interval '65 minutes'
    and p.status = 'actif'
    and not exists (
      select 1 from notifications n
      where n.user_id = pp.user_id and n.type = 'plan_reminder'
        and n.payload->>'plan_id' = p.id::text
    );
$$);

```

La fenêtre de 55-65 minutes évite les doublons d'un job qui tourne toutes les 5 minutes ; la clause `not exists` est une seconde garde contre le doublon, indépendante de la fenêtre.

### Fallback — si `pg_cron` n'est pas disponible sur le projet retenu

**CORE MVP, prêt à activer sans réécriture** : les trois requêtes ci-dessus sont encapsulées dans une seule Edge Function `scheduled-tasks-tick`, appelée par un déclencheur externe toutes les 5 minutes :

- **Option retenue par défaut** : GitHub Actions avec un déclencheur `schedule` (cron GitHub), qui appelle l'Edge Function via une requête HTTP authentifiée. Aucune dépendance à un service tiers payant supplémentaire, cohérent avec une équipe qui utilise déjà GitHub (§27).
- **Alternative équivalente** : tout scheduler HTTP externe (cron-job.org, EAS lui-même si un mécanisme de tâche périodique y est ajouté) — interchangeable sans changer le code de l'Edge Function, seul le déclencheur change.

**Ce choix ne bloque rien en amont** : la logique métier vit entièrement dans l'Edge Function (ou dans le SQL si `pg_cron` est disponible), jamais dans le mécanisme de déclenchement lui-même — passer de l'un à l'autre ne demande aucune réécriture de règle, seulement un changement de configuration d'infrastructure.

**Décision fermée** : le MVP démarre avec `pg_cron` si le plan Supabase retenu l'expose (à vérifier avant §39, cf. décision 4 ci-dessous où le choix d'infrastructure global se confirme) ; sinon, bascule immédiate sur le fallback GitHub Actions, sans aucune différence de comportement produit.

---

## 39. Device signal — signal technique minimal non biométrique — fermeture décision 2

**CORE MVP, volontairement minimal.** Aucune sophistication de fingerprinting en V1 — classée LATER dans son intégralité (cohérent avec Safety Layer §16, qui range déjà "détection d'empreinte de dispositif plus sophistiquée" en LATER).

### Ce qui est collecté

Un identifiant unique **déjà généré par le système d'exploitation pour l'app**, sans aucune bibliothèque de fingerprinting tierce, sans aucun croisement avec des signaux matériels (pas de liste d'applications installées, pas d'empreinte de capteurs, pas d'identifiant publicitaire) :

- iOS : `identifierForVendor` (natif, propre à l'app, remis à zéro si toutes les apps du même vendeur sont désinstallées).
- Android : identifiant d'installation généré par Expo (`Application.androidId` ou équivalent Expo Application Services), propre à l'installation.

```sql
-- device_id fait désormais partie du schéma de base de users (§6, V1.2) — aucune migration séparée nécessaire.

```

Ce champ est **stocké uniquement tant que le compte existe**, comme toute autre donnée de `users` — supprimé avec le compte, sans exception, cohérent avec Safety Layer §13.

### Ce que ce signal permet, honnêtement

Détecter qu'**un même appareil crée plusieurs comptes sur une fenêtre courte** (Safety Layer §5, premier signal listé) :

```sql
create or replace function fn_check_device_multi_account(p_device_id text)
returns int language sql stable as $$
  select count(*) from users
  where device_id = p_device_id
    and created_at > now() - interval '24 hours';
$$;

```

Appelée depuis `onboarding-complete-profile` (§13) : si le résultat dépasse un seuil paramétrable (`app_config`, ex. 3 comptes/24h), un enregistrement est ajouté à `behavior_signals` (type `multi_account_device`) — **aucune action automatique de blocage en V1**, seulement une collecte, cohérente avec la voie C de Safety Layer §7 explicitement classée LATER.

### Ce que ce signal ne permet pas, dit explicitement

- Ne survit pas à une désinstallation/réinstallation sur iOS (remise à zéro possible de `identifierForVendor`).
- Ne relie pas deux appareils physiques différents utilisés par la même personne.
- N'est en aucun cas un identifiant biométrique, ni dérivé d'une caractéristique physique de la personne.

### Ce qui est explicitement exclu, et reste LATER

- Toute empreinte conservée après suppression du compte — **aucune, à aucun degré** : `device_id` disparaît avec la ligne `users` supprimée, comme tout le reste (cohérent avec la correction déjà verrouillée de Safety Layer §9 : aucun mécanisme anti-récidive post-suppression dans le MVP).
- Fingerprinting avancé (canvas fingerprinting, croisement de capteurs, identifiants publicitaires) : **LATER**, non implémenté, non préparé dans le schéma au-delà de la colonne `device_id` elle-même.
- Toute logique reliant ce signal à une décision de blocage automatique : **LATER**, voie C de Safety Layer §7.

---

## 40. SMS Provider Decision — RETIRÉE EN V1.2

Cette section documentait le cadre de décision du provider SMS pour l'OTP téléphone. **Elle est retirée dans son intégralité** : l'authentification par téléphone est abandonnée (§10, §10bis), remplacée par Sign in with Apple et Sign in with Google via Supabase Auth. Aucun provider SMS, aucun coût récurrent par inscription, aucune décision de ce type à prendre. Le contenu original de cette section (critères de délivrabilité marocaine, intégration webhook, coûts) n'a plus d'objet et n'est pas conservé au-delà de cette note — conformément au principe de ne pas laisser une section technique obsolète décrire un mécanisme qui n'existe plus dans le produit.

---

## 41. Checklist technique Privacy / Stores — fermeture décision 5

**CORE MVP pour la checklist elle-même** (elle doit exister et être suivie) ; **les documents qu'elle couvre restent des livrables juridiques séparés, non rédigés ici.**

| **ÉlémentCe que la checklist doit couvrirSource produit** |                                                                                                                                                                                                                                                                                                                                                          |                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Privacy Policy (document public)**                      | Liste exhaustive des données collectées (identifiant Apple/Google, prénom, date de naissance/âge, ville, photo, bio, intérêts, signaux comportementaux bruts) ; **aucun numéro de téléphone collecté pour le MVP** ; finalités de chacune ; durées de conservation ; principe de minimisation ; mention explicite de l'absence de traitement biométrique | Safety Layer §13-14, Onboarding §8-9 |
| **Sign in with Apple**                                    | Déclarer explicitement l'usage de Sign in with Apple ; respecter l'exigence Apple de proposer cette option dès qu'une autre méthode de connexion tierce (ici Google) est présente ; documenter si l'email relais Apple (Hide My Email) est accepté sans dégrader l'usage du compte                                                                       | §10, contrainte App Store            |
| **Sign in with Google**                                   | Déclarer l'usage du SDK Google Sign-In, les scopes demandés (identité uniquement, pas d'accès Calendar/Contacts/Drive)                                                                                                                                                                                                                                   | §10                                  |
| **Google Play Data Safety**                               | Équivalent Android de la déclaration Apple — mêmes catégories collectées, mêmes exclusions ; préciser qu'aucune donnée n'est partagée avec Apple/Google au-delà de l'authentification elle-même (pas de partage marketing)                                                                                                                               | Blueprint §6.1, §34                  |
| **Âge 18+**                                               | Déclaration de classification d'âge sur les deux stores ; mécanisme de vérification déclarative décrit (date de naissance, pas de pièce d'identité) à documenter clairement pour ne pas être lu comme une vérification d'âge forte que le produit ne fait pas                                                                                            | Onboarding, écran Date de naissance  |
| **Localisation**                                          | Préciser dans la Privacy Policy et les déclarations stores que la position n'est **jamais stockée**, transite uniquement le temps d'un appel serveur pour le calcul de proximité (§9 de ce document)                                                                                                                                                     | Blueprint §15 point 3                |
| **Photo**                                                 | Préciser l'usage strict (reconnaissance sociale IRL), l'absence de traitement biométrique ou de reconnaissance faciale, les règles de visibilité (uniquement dans un contexte de plan, jamais un annuaire)                                                                                                                                               | Blueprint §6.2, §7.2                 |
| **Suppression de compte**                                 | Documenter le parcours de suppression (Paramètres → Supprimer mon compte), les données effectivement supprimées (photo, profil, identifiant Apple/Google associé, `device_id`), et l'absence de délai chiffré engagé publiquement tant qu'il n'est pas validé juridiquement                                                                              | Safety Layer §13                     |

**Cette checklist ne remplace aucun document juridique.** Elle sert à vérifier, avant soumission aux stores, qu'aucune déclaration technique ne contredit les 8 specs LOCKED — en particulier qu'aucune case "biométrie" ou "identité vérifiée" ne soit cochée par erreur dans les formulaires de confidentialité des stores, ce qui serait un contresens direct avec Blueprint §6.5.

---

### 1. Contradictions éventuelles

**Résolu.** Les 8 spécifications produit et ce Technical Blueprint sont désormais mutuellement cohérents sur l'authentification : Blueprint V1.3, Design System V1.3, Home V1.3, Create Plan V1.3, Plan Detail + Join V1.3, Onboarding V1.3, Safety Layer V1.1, Plan Group Chat V1 (inchangé, toujours sans contradiction) — plus ce Technical Blueprint V1.3. Toutes les références au téléphone/OTP identifiées lors des passes précédentes ont été propagées ou corrigées ; les seules occurrences restantes dans l'ensemble des documents sont des mentions historiques dans les changelogs respectifs.

**Aucune contradiction de fond identifiée.** Chaque règle sensible (condition d'accès en 6 points, `under_review` binaire, règle 15.1 de l'adresse, capacité 2-20, limite de 3 plans, absence de badge/biométrie) reste tracée jusqu'à une contrainte SQL, une RLS ou une Edge Function précise, sans écart, et est désormais cohérente d'un bout à l'autre de la chaîne des 8 documents produit.

### 2. Décisions techniques encore manquantes

- **Comportement exact si Apple ou Google refuse de fournir un email** (Apple "Hide My Email" fonctionne toujours, mais certains comptes Google d'entreprise restreignent parfois le partage d'email) — à tester avant la Phase 2, sans quoi la création de compte pourrait échouer silencieusement pour une minorité d'utilisatrices.
- **La rédaction effective des documents juridiques** (Privacy Policy, déclarations stores) reste un livrable séparé, hors du périmètre technique — la checklist de §41 en fixe le contenu attendu, pas le texte final.

### 3. Risques techniques importants

- **`fn_discover_plans`**** en boucle synchrone sur 4 paliers** : rapide à faible densité ; le palier "ville entière" (le plus coûteux) doit être instrumenté en temps de réponse dès le premier déploiement, pas après coup.
- **Race condition théorique sur ****`fn_check_max_active_plans`** : sous forte concurrence (deux créations quasi simultanées du même compte), une fenêtre de contournement existe en théorie. Risque faible en usage réel, mais à documenter comme limite connue.
- **Contournement du blocage d'un compte mineur par changement de compte Apple/Google** (§10) : un compte bloqué pour minorité peut retenter l'onboarding avec un autre compte Apple/Google — limite assumée, structurellement identique à l'ancien risque "un autre numéro de téléphone", ni pire ni meilleure, mais à ne pas présenter comme résolue.
- **Renouvellement du secret JWT Apple (flow OAuth Android), obligation Apple tous les 6 mois** (§10) : un oubli casse l'authentification Apple pour toutes les utilisatrices Android sans préavis visible côté app — à planifier comme tâche récurrente d'exploitation dès la mise en production, pas comme un détail d'implémentation ponctuel.
- **Disponibilité de ****`pg_cron`** : risque couvert par un fallback explicite (§38, GitHub Actions + Edge Function) — à vérifier tôt lors de la création du projet Supabase.
- **Dépendance externe pour la résolution automatique de lieu (§9, OPTIONNELLE)** : un dépassement de quota dégraderait silencieusement vers le fallback quartier — acceptable fonctionnellement, mais à monitorer.
- **Vue ****`plans_full`**** recalculée à chaque lecture** plutôt qu'une colonne matérialisée : correct pour la cohérence, à surveiller en performance si le nombre de participantes par plan croît significativement — non préoccupant aux volumes du MVP.

---

**Ce document ne modifie, à titre technique, aucune des règles de plans/capacité/participation/chat/adresse/reports/blocks/modération/****`under_review`****/biométrie des 8 spécifications produit LOCKED.** Il modifie le mécanisme d'authentification, **en cohérence désormais complète** avec Blueprint V1.3, Onboarding V1.3 et Safety Layer V1.1, révisés dans la même passe.

---

## SYNTHÈSE — RÉCONCILIATION AUTHENTIFICATION V1.3

### A. Architecture d'authentification finale

- **Sign in with Apple** et **Sign in with Google**, exclusivement — aucune autre méthode, aucun mot de passe, aucun téléphone requis, **aucun champ de téléphone dans le schéma**.
- Côté client : `expo-apple-authentication` et le SDK Google Sign-In récupèrent chacun un `id_token` ; l'app appelle `supabase.auth.signInWithIdToken({ provider, token })`. Aucun secret client exposé, aucun serveur intermédiaire pour l'authentification elle-même.
- `auth.users` est créé nativement par Supabase Auth ; un trigger (`fn_handle_new_auth_user`, §10) crée la ligne `public.users` correspondante avec seulement `id` et `auth_provider` — le reste du profil (prénom, date de naissance, ville, photo) est complété par les écrans d'onboarding suivants.
- Condition "compte prêt à participer" : `auth_provider IS NOT NULL AND prenom IS NOT NULL AND date_naissance IS NOT NULL AND ville_id IS NOT NULL AND photo_url IS NOT NULL AND account_status = 'active'` — le téléphone en est totalement absent, y compris comme condition implicite ou champ optionnel.

### B. Modifications par rapport au Technical Blueprint V1.2

| **SectionModification**    |                                                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| En-tête                    | Version bump V1.2 → V1.3 ; signal de cohérence résolu (Blueprint, Onboarding, Safety Layer révisés dans la même passe)                               |
| §2 Structure du repository | Commentaire "remplace auth.tsx + otp.tsx" retiré — `auth.tsx` est simplement l'écran Apple/Google, pas le résultat visible d'une fusion              |
| §3 Navigation              | Référence à l'Onboarding mise à jour vers la V1.3                                                                                                    |
| §4 Composants              | `PhoneConfirmedText` retiré de l'inventaire — n'a plus d'objet                                                                                       |
| §6 Schéma `users`          | **`phone`**** supprimé intégralement** — plus de champ nullable, plus d'index conditionnel ; décision explicite de ne rien anticiper                 |
| §10                        | Note "Numéro de téléphone optionnel, LATER" retirée ; remplacée par la confirmation qu'aucun téléphone n'est collecté, stocké ou déclaré pour le MVP |
| §21 Services               | `auth.service.ts` : `signInWithOtp, verifyOtp` → `signInWithApple, signInWithGoogle`                                                                 |
| §23 Gestion des erreurs    | Exemple de message corrigé (`"Confirme ton numéro..."` → `"Ajoute une photo..."`)                                                                    |
| §34 Stores                 | Retrait de la mention conditionnelle du téléphone dans la déclaration Apple                                                                          |
| §36 Tableau MVP/LATER      | Ligne "téléphone optionnel, OPTIONNELLE" remplacée par une ligne explicite "absent du MVP, y compris comme champ optionnel"                          |
| §41 Checklist              | Ligne "Téléphone (optionnel, LATER)" retirée ; ligne Privacy Policy reformulée sans référence au téléphone                                           |
| Audit croisé               | Contradiction transverse marquée résolue ; contradictions résiduelles recentrées sur les 4 documents non révisés dans cette passe                    |

**Non modifié, vérifié explicitement** : §1, §5, §7-9, §11, §14-17, §19-20, §22, §24, §26-33, §35, §37-40 — aucune règle de plans, capacité, participation, chat, adresse exacte, reports, blocks, modération, `under_review` ou biométrie n'y a été touchée.

### C. Implications App Store / Google Play

- **Sign in with Apple reste obligatoire, pas seulement recommandé** : la règle App Store (Guideline 4.8) impose de proposer Sign in with Apple dès qu'une autre méthode de connexion tierce (ici Google) est offerte sur iOS.
- **Suppression d'une catégorie de risque de conformité** : aucun numéro de téléphone dans le schéma signifie une déclaration *Contact Info* allégée dans les deux stores, et la disparition de toute dépendance à un provider SMS tiers dans les déclarations de partage de données.
- **Email relais Apple ("Hide My Email")** : si un jour une fonctionnalité nécessite de contacter une utilisatrice par email, un compte connecté via l'email relais Apple limite cette possibilité — à anticiper dans la conception de toute fonctionnalité future qui en dépendrait, sans impact sur le MVP actuel qui ne communique que par notification push.
- **Âge 18+** : déclaration inchangée sur les deux stores, le mécanisme reste déclaratif (date de naissance), indépendant de la méthode d'authentification.
- **Aucune nouvelle contrainte Google Play** au-delà de la déclaration Data Safety mise à jour (§41).

### D. Le Technical Blueprint peut-il être LOCKED maintenant ?

**Oui, sans réserve.** Les 8 spécifications produit — Blueprint V1.3, Design System V1.3, Home V1.3, Create Plan V1.3, Plan Detail + Join V1.3, Onboarding V1.3, Safety Layer V1.1, Plan Group Chat V1 — et ce Technical Blueprint V1.3 sont désormais mutuellement cohérents sur l'authentification et sur l'ensemble des règles qu'ils partagent. La contradiction transverse qui bloquait le verrouillage en V1.2, puis la réserve sur les quatre propagations downstream en V1.3 pré-réconciliation, sont l'une et l'autre résolues.

**En résumé** : le Technical Blueprint V1.3 peut être verrouillé comme source de vérité technique, sans condition suspensive restante.