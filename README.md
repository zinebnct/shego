# SHEGO

Application mobile (iOS / Android) de **plans entre femmes** — _Find your girls. Go._ Lancement : Casablanca.
Le produit est centré sur les **plans** (DISCOVER → CREATE → JOIN → CHAT → MEET), pas sur les profils.

> **Source de vérité : `docs/` (9 spécifications LOCKED).** Ce dépôt les implémente ; il ne les modifie jamais
> (`docs/` est exclu de Prettier et d'ESLint). En cas de doute produit, UX, sécurité ou fonctionnel : la spec fait foi.

État : **Phase 1 — socle technique** (bootstrap). Les écrans fonctionnels (Home, Create Plan, Join, Chat, Carte…)
sont des squelettes de routage ; la couche technique qui les portera est en place. Voir [Ce qui reste à faire](#ce-qui-reste-à-faire).

## Règles non négociables (rappel)

- Mobile uniquement : React Native + Expo (SDK 57), Expo Router, TypeScript strict.
- Backend : Supabase (Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions) ; notifications Expo ; builds EAS.
- Authentification : **Sign in with Apple / Sign in with Google uniquement**. Elle authentifie l'accès au compte — elle
  n'est **jamais** présentée comme une preuve d'identité ou de genre.
- Aucun numéro de téléphone, aucun code à usage unique, aucune biométrie, aucun selfie de vérification, aucune
  reconnaissance faciale, aucune pièce d'identité, aucune vérification de genre, aucun badge, aucun trust score.
- Photo de profil obligatoire ; `account_status` ∈ `active | under_review | suspended | banned` ;
  `under_review` bloque **Create, Join et Chat** (règle binaire).
- Français uniquement en V1 ; architecture i18n / RTL prête pour `fr`, `ar`, `en`.

Ces règles sont **vérifiées automatiquement** (`npm run check:guards`, exécuté en CI) — voir [Garde-fous](#garde-fous-automatiques).

## Architecture

```
┌─────────────────────────┐        ┌──────────────────────────────────────┐
│  App mobile (Expo)      │        │  Supabase (un projet par environnement) │
│  app/  → routes         │  RLS   │  Postgres + PostGIS   (RLS partout)     │
│  src/components         │◀──────▶│  Auth  (Apple / Google)                 │
│  src/hooks, stores      │        │  Storage (bucket `avatars`, privé)      │
│  src/services  ─────────┼───────▶│  Realtime (1 canal par plan)            │
│  (seul point d'accès)   │        │  Edge Functions (Deno)                  │
└─────────────────────────┘        └──────────────────────────────────────┘
                                              │
                                   Expo Push Service (EAS)
```

**Le serveur est la seule barrière de sécurité.** Toute règle sensible (compte prêt, `under_review`, blocages, adresse
exacte, limite de 3 plans, chat réservé aux membres) est appliquée par la RLS et les Edge Functions. L'interface se
contente de choisir le bon écran _avant_ l'échec.

**Aucun composant React n'appelle Supabase.** Seuls `src/services/*` (et `src/lib/supabase.ts`) importent le client ;
une règle ESLint l'impose. Chaque fonction de service retourne `Result<T> = { data } | { error }` avec des codes
d'erreur stables (`src/types/errors.ts`), jamais un message Postgres brut.

### Condition d'accès « compte prêt » (LOCKED)

Une seule définition, en deux miroirs qui ne divergent pas :

| Où | Fichier | Utilisé par |
| --- | --- | --- |
| SQL | `fn_is_account_ready`, `fn_is_account_active` (migration 3) | toutes les policies RLS, Edge Functions |
| TypeScript | `src/lib/account-readiness.ts` → hook `useAccountReady()` | guards de navigation, `useAccountGate`, bannières |

Condition : session Apple/Google valide · prénom · date de naissance 18+ · ville · photo · `account_status = active`.
Les règles `account_status` côté client vivent **uniquement** dans `src/lib/account-status.ts`.
Un seul composant, `AccountGateSheet`, affiche « ce qui manque » et l'information `under_review`, invoqué depuis tous
les points d'entrée (`+ Créer`, `Rejoindre`, chat) via `useAccountGate().requireReady(action)`.

### Adresse exacte (règle 15.1)

`plans.adresse_exacte` n'est **pas** sélectionnable via la table (privilège de colonne). Le client lit `plans_public`
(sans adresse) ou `plans_full` (créatrice / participante acceptée, filtré côté serveur). Jamais de `select *` sur `plans`.

## Structure du projet

```
app/                          Expo Router — une route = un écran
  _layout.tsx                 providers, polices, i18n, guard de navigation
  index.tsx                   entrée « / » (redirection par useProtectedRoute)
  (onboarding)/               11 écrans : welcome, welcome-confiance, auth, prenom, date-naissance,
                              ville, photo, interets, bio, permissions-notifications, permissions-localisation
  (tabs)/                     home, mes-plans, messages, profil  (+ bouton central « Créer » dans la TabBar)
  plan/[id]/index.tsx         Plan Detail          plan/[id]/chat.tsx   Plan Chat
  create-plan.tsx             modal plein écran, hors de la pile Tabs
  settings/                   Paramètres
  account-restricted.tsx      écran dédié suspended / banned (Onboarding §5, DS §14)
src/
  components/                 foundation · actions · forms · feedback · profile · navigation · plan · map · chat
  design-system/              tokens (couleurs, typo, spacing, radii, ombres, motion) — Design System V1.3
  hooks/                      useAuth, useAccountReady, useAccountGate, useProtectedRoute, usePlanChat, permissions…
  services/                   auth · profile · plans · participation · chat · reports · blocks · notifications · moderation
  stores/                     session.store.ts (Zustand)
  lib/                        supabase.ts (client typé), account-status/readiness, age, onboarding, secure-storage
  config/env.ts               variables d'environnement validées
  i18n/                       fr.json, index, locales (fr/ar/en + RTL), errors (code → texte)
  types/                      database.types.ts, domain, result, errors, categories, notifications
supabase/
  migrations/                 8 migrations SQL versionnées
  functions/                  Edge Functions (Deno) : _shared + 16 fonctions
  tests/rls-smoke.mjs         test d'intégration SQL (PostgreSQL réel + shims)
  config.toml · seed.sql
backoffice/                   application web de modération — hors Phase 1 (voir son README)
e2e/                          Maestro (socle)
scripts/                      check-guards.mjs, check-sql.mjs
.github/workflows/            ci.yml · db.yml · scheduled-tasks.yml
```

## Installation

Prérequis : **Node ≥ 24**, npm ≥ 11, un compte Expo/EAS, la [CLI Supabase](https://supabase.com/docs/guides/local-development)
(+ Docker) pour le backend local, Xcode / Android Studio pour les builds de développement.

```bash
npm ci
cp .env.example .env.local     # puis renseigner les variables EXPO_PUBLIC_* (voir ci-dessous)
```

## Lancement local

```bash
# 1. Backend local (Docker) : applique migrations + seed, expose l'API sur http://127.0.0.1:54321
npm run db:start               # supabase start
npm run db:reset               # (re)crée le schéma depuis supabase/migrations + supabase/seed.sql
# copier l'URL et la clé « anon » affichées dans .env.local (EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY)

# 2. Application — Sign in with Google (SDK natif) exige un build de développement, pas Expo Go :
npm run eas:dev                # ou : npm run ios / npm run android  (expo run:*, après prebuild)
npm run start:dev-client
```

Expo Go suffit pour naviguer dans les écrans (le module Google est chargé à la demande et n'est requis qu'au tap).

## Variables d'environnement

Détail complet et commenté dans [`.env.example`](.env.example). Principe : **l'app ne contient que des identifiants publics**.

| Variable | Où | Rôle |
| --- | --- | --- |
| `EXPO_PUBLIC_APP_ENV` | app | `development` \| `staging` \| `production` |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | app | projet Supabase de l'environnement (clé `anon` uniquement) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB` / `_IOS`, `GOOGLE_IOS_URL_SCHEME` | app / build | client Google (publics par nature) |
| `SUPABASE_SERVICE_ROLE_KEY` | **serveur** | Edge Functions uniquement — **jamais** dans l'app |
| `APPLE_*`, `GOOGLE_CLIENT_SECRET`, `PLACES_API_KEY` | **serveur** | Supabase Auth / Edge Functions — jamais dans l'app |

Garde-fous : `src/config/env.ts` refuse une clé `anon` qui serait en réalité un JWT `service_role` ; `check:guards`
échoue si un secret backend est référencé dans le code mobile ; aucun `.env` réel ne peut être versionné.

**Environnements** (un projet Supabase distinct chacun — Blueprint §26) :

| Env | Profil EAS | Canal | Identifiant app |
| --- | --- | --- | --- |
| development | `development` (dev client, interne) | development | `com.shego.app.dev` |
| staging | `preview` | staging | `com.shego.app.staging` |
| production | `production` | production | `com.shego.app` |

Les valeurs `EXPO_PUBLIC_*` de staging/production sont des variables **EAS** (`eas env:create`), jamais committées.
⚠️ `com.shego.app` est un **identifiant provisoire** à confirmer avant le premier build (Apple, Google, Supabase Auth).

## Supabase

### Migrations (`supabase/migrations/`)

| # | Fichier | Contenu |
| --- | --- | --- |
| 1 | `…_extensions` | PostGIS, pgcrypto |
| 2 | `…_core_schema` | 13 tables, index, contraintes (18+, capacité 2-20…), trigger des 3 plans actifs |
| 3 | `…_auth_and_access_functions` | trigger de création du profil, `fn_is_account_ready/active`, blocage bilatéral, rôle admin |
| 4 | `…_rls_and_privileges` | RLS sur les 13 tables, privilèges par colonne, vues `plans_public` / `plans_full` / `public_profiles` |
| 5 | `…_business_functions_and_triggers` | `fn_discover_plans` (rayon élastique), seuil de signalements, blocage→retrait, notifications |
| 6 | `…_scheduler` | expiration des demandes, archivage à +24 h, rappels ; `pg_cron` si disponible |
| 7 | `…_storage_and_realtime` | bucket `avatars` privé + policies, publication Realtime de `messages` |
| 8 | `…_reference_data` | Casablanca, 12 catégories, `app_config` |

```bash
npm run db:reset          # local : applique tout + seed.sql (données fictives, dev uniquement)
supabase link --project-ref <ref> && supabase db push     # staging / production (jamais de modification manuelle)
```

### Génération des types

`src/types/database.types.ts` est **écrit à la main** au format `supabase gen types` (aucune instance n'était disponible
lors du bootstrap). **À régénérer dès qu'une instance existe** :

```bash
npm run db:types           # depuis la base locale
npm run db:types:remote    # depuis un projet (SUPABASE_PROJECT_ID)
```

### Auth Apple / Google

Configurer les deux fournisseurs (dashboard ou `supabase/config.toml` + variables) : Services ID Apple distinct de
l'App ID, clé privée Apple stockée **côté Supabase uniquement**, client Google « Web » pour valider l'`id_token`.
Le secret JWT Apple (flux OAuth Android) **expire tous les 6 mois** : à planifier comme tâche d'exploitation récurrente.
Flux : iOS natif (`expo-apple-authentication`) · Android via `signInWithOAuth` + `expo-web-browser` · Google natif.
Aucune autre méthode de connexion n'est activée (`[auth.email] enable_signup = false`).

### Notifications

Le trigger SQL écrit dans `notifications` (contrat de payload du Blueprint §37, jamais d'adresse exacte). L'envoi push
est fait par l'Edge Function `notifications-dispatch`, à brancher via un **Database Webhook** sur `INSERT` de
`notifications` (à configurer dans le dashboard de chaque projet). Huit types seulement, aucune notification marketing.

### Tâches planifiées

`pg_cron` si le plan Supabase l'expose (migration 6, automatique). Sinon : fallback prêt — Edge Function
`scheduled-tasks-tick` + workflow `.github/workflows/scheduled-tasks.yml` (désactivé par défaut).

## Scripts npm

| Script | Rôle |
| --- | --- |
| `npm run check` | **tout** : typecheck, lint, tests, garde-fous, SQL |
| `npm run typecheck` / `lint` / `format:check` | TypeScript strict · ESLint (0 warning) · Prettier |
| `npm test` / `test:ci` | Jest + React Native Testing Library |
| `npm run check:guards` | règles non négociables (voir ci-dessous) |
| `npm run check:sql` | parse toutes les migrations avec le vrai parseur PostgreSQL |
| `npm run test:db` | intégration SQL sur PostgreSQL réel (RLS, triggers, planificateur) — voir en-tête du fichier |
| `npm run db:start / stop / reset / types` | Supabase local |
| `npm run e2e` | Maestro (socle) |
| `npm run eas:dev / staging / production` | builds EAS |

### Garde-fous automatiques

`scripts/check-guards.mjs` échoue si : un terme interdit (contact téléphonique, code à usage unique, biométrie, liveness,
reconnaissance faciale, selfie, CIN/CNIE, badge, trust score) apparaît dans le **code** (commentaires ignorés) ; un secret
backend est exposé à l'app ; un `.env` réel est versionné ; une route obligatoire manque ; `account_status` est comparé à
un littéral hors de `src/lib/account-status.ts` ; une table n'a pas de RLS ; un module hors `src/services` importe Supabase.
ESLint impose en plus : services seuls autorisés à parler à Supabase, propriétés logiques (`start`/`end`) pour le RTL,
aucune chaîne en dur dans les composants.

## Qualité et CI

`.github/workflows/ci.yml` : **lint**, **typecheck**, **tests unitaires**, **garde-fous + SQL** à chaque PR/push sur
`main` et `develop`. `db.yml` applique les migrations sur une pile Supabase locale réelle quand `supabase/**` change.
Branches : `main` (déployable, protégée) · `develop` · `feature/*` (Blueprint §27).

## Écarts assumés par rapport au Blueprint technique

Le Blueprint a été implémenté fidèlement ; ces écarts corrigent des défauts qui rendaient une règle LOCKED fausse ou
contournable. Chacun est annoté « ÉCART » dans le SQL.

| Sujet | Écart | Raison |
| --- | --- | --- |
| Blocage bilatéral | fonction `fn_is_blocked_between` (security definer) au lieu d'un `exists` sur `blocks` dans les policies | `blocks_select_own` ne montre que ses propres blocages : « je suis bloquée par X » était invisible |
| Profils d'autres utilisatrices | vue `public_profiles` (prénom, âge, ville, bio, photo) au lieu d'une policy de ligne sur `users` | une policy ne masque pas de colonnes : `date_naissance`, `device_id`, `push_token` étaient exposés |
| `account_status` | non modifiable par le client (privilèges de colonne) | sinon une utilisatrice `under_review` se remettait `active` |
| Adresse exacte | privilège de colonne + `plans_public` en `security_invoker` | la policy de découverte laissait lire la table entière |
| Rôle admin | `app_metadata.role = 'admin'` | le claim JWT racine `role` est réservé à PostgREST |
| Policies incomplètes | `plans_select_own_or_member`, `blocks_delete_own`, `pp_select` élargi, RLS sur `cities/interests/user_interests/app_config` | Mes plans, chat archivé, déblocage, liste des participantes, « RLS sur 100 % des tables » |
| `fn_discover_plans` | une liste finale sans doublons, paliers lus dans `app_config` | l'exemple renvoyait les mêmes plans à chaque palier |
| Seuil de signalements | journal d'audit alimenté seulement si le statut change | évitait un doublon par signalement supplémentaire |
| `users` | `id → auth.users(id) on delete cascade`, `push_token`, `chk_users_photo_path` | `account-delete`, notifications (§15), photo unique par utilisatrice (§11) |
| Messages | `select` exige un compte `active` ; expéditrice bloquée masquée | `under_review` ⇒ aucun Chat, y compris la lecture |

## Ce qui reste à faire

- **Edge Functions** : squelettes authentifiés + contrat d'erreur (`_shared/`) ; seule `scheduled-tasks-tick` est complète.
  La logique métier des 15 autres arrive avec les phases fonctionnelles.
- **Écrans fonctionnels** : Onboarding (saisies, photo), Home / Carte, Create Plan, Plan Detail + Join, Chat, Mes plans, Profil.
- **Icônes de catégorie** (12) et mini-cartes de plan : assets design (`Icon` propose un repli générique).
- **Assets de marque** : icône et splash sont ceux d'Expo (provisoires) ; identifiants d'app à confirmer.
- **Backoffice de modération** (`backoffice/`), documents juridiques, politique de confidentialité, checklist stores (§41).
- À valider contre une **vraie instance Supabase** : `supabase db reset`, `supabase gen types`, Auth Apple/Google,
  Realtime avec RLS — voir `db.yml`.
- Décisions produit à trancher (signalées, non tranchées ici) : notification d'annulation de plan (absente du contrat §37),
  destinataires du rappel `plan_reminder` (créatrice incluse ?), messages d'une personne bloquée (masqués par la RLS vs
  « grisés » dans Plan Group Chat §8), texte de `max_active_plans` (provisoire).
