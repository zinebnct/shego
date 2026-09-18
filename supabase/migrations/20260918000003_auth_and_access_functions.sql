-- SHEGO — Migration 3/8 : authentification et fonctions d'accès centralisées
-- Source : Technical Blueprint V1.3 §10 (trigger de création de profil), §12 (condition d'accès), Blueprint produit §6.4.
--
-- Point clé : la condition « compte prêt » (6 points) et la règle `under_review` vivent ICI, UNE seule fois,
-- et sont réutilisées par toutes les policies RLS. Aucune policy ne recopie la condition.

-- ---------------------------------------------------------------------------
-- Création du profil applicatif à la première connexion Apple/Google (Blueprint §10)
-- Seuls `id` et `auth_provider` sont renseignés ; le reste vient de l'onboarding.
-- Un provider autre qu'Apple/Google viole la contrainte `users.auth_provider` et fait échouer la création
-- (aucune autre méthode de connexion n'est autorisée — voir aussi supabase/config.toml).
-- ---------------------------------------------------------------------------
create or replace function public.fn_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider text;
begin
  v_provider := new.raw_app_meta_data ->> 'provider';  -- 'apple' | 'google'
  insert into public.users (id, auth_provider)
  values (new.id, v_provider)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.fn_handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Rôle admin (backoffice de modération)
-- ÉCART : le claim JWT racine `role` est réservé par PostgREST au rôle Postgres (`authenticated`) ;
-- le rôle applicatif « admin » vit dans `app_metadata` (modifiable uniquement côté service).
-- ---------------------------------------------------------------------------
create or replace function public.fn_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ---------------------------------------------------------------------------
-- Condition d'accès « compte prêt à participer » — Blueprint produit §6.4 (LOCKED)
--   1. session Apple/Google valide  → porté par `auth.uid()` non nul (policies `to authenticated`) + auth_provider
--   2. prénom renseigné
--   3. date de naissance renseignée, 18+ confirmé par le calcul
--   4. ville renseignée
--   5. photo de profil présente
--   6. account_status = 'active'    → exclut under_review, suspended, banned
-- ---------------------------------------------------------------------------
create or replace function public.fn_is_account_ready(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = p_user_id
      and u.auth_provider is not null
      and u.prenom is not null
      and u.date_naissance is not null
      and u.date_naissance <= (current_date - interval '18 years')
      and u.ville_id is not null
      and u.photo_url is not null
      and u.account_status = 'active'
  );
$$;

-- Chat : seule la règle binaire `under_review` / restrictions de modération compte (Blueprint §12, messages_*).
create or replace function public.fn_is_account_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = p_user_id and u.account_status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- Blocage bilatéral — ÉCART nécessaire : `blocks_select_own` ne laisse voir que les blocages émis par
-- l'utilisatrice ; une policy qui interrogerait `blocks` directement ne verrait jamais « je suis bloquée par X ».
-- Cette fonction (security definer) rend la règle « dans les deux sens » réellement effective.
-- ---------------------------------------------------------------------------
create or replace function public.fn_is_blocked_between(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_a is not null and p_user_b is not null and p_user_a <> p_user_b
     and exists (
       select 1 from public.blocks b
       where (b.blocker_id = p_user_a and b.blocked_id = p_user_b)
          or (b.blocker_id = p_user_b and b.blocked_id = p_user_a)
     );
$$;

-- Appartenance à un plan : créatrice OU participante acceptée (Blueprint §12, table d'accès du chat).
-- security definer : évite la récursion de policies sur plan_participants.
create or replace function public.fn_is_plan_member(p_plan_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.plans p where p.id = p_plan_id and p.creator_id = p_user_id)
      or exists (
        select 1 from public.plan_participants pp
        where pp.plan_id = p_plan_id and pp.user_id = p_user_id and pp.status = 'accepted'
      );
$$;

-- Ces fonctions sont internes : appelables par les policies (exécutées avec les droits de l'appelant),
-- pas des endpoints RPC pour `anon`.
revoke execute on function public.fn_handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.fn_is_admin() from public, anon;
revoke execute on function public.fn_is_account_ready(uuid) from public, anon;
revoke execute on function public.fn_is_account_active(uuid) from public, anon;
revoke execute on function public.fn_is_blocked_between(uuid, uuid) from public, anon;
revoke execute on function public.fn_is_plan_member(uuid, uuid) from public, anon;
grant execute on function public.fn_is_admin() to authenticated, service_role;
grant execute on function public.fn_is_account_ready(uuid) to authenticated, service_role;
grant execute on function public.fn_is_account_active(uuid) to authenticated, service_role;
grant execute on function public.fn_is_blocked_between(uuid, uuid) to authenticated, service_role;
grant execute on function public.fn_is_plan_member(uuid, uuid) to authenticated, service_role;

revoke execute on function public.fn_check_max_active_plans() from public, anon, authenticated;
