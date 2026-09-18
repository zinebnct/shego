-- SHEGO — Migration 7/8 : Storage (bucket `avatars`) et Realtime (chat)
-- Source : Technical Blueprint V1.3 §11 (un seul bucket, aucun bucket de vérification ou de biométrie), §14 (Realtime).

-- ===========================================================================
-- Bucket `avatars` — privé, un seul fichier actif par utilisatrice : avatars/{user_id}/profile.jpg
-- (compression/redimensionnement côté client avant upload ; JPEG uniquement).
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lecture : toute utilisatrice authentifiée, sauf blocage (dans les deux sens) avec la propriétaire de la photo.
-- Le premier segment du chemin est l'identifiant de la propriétaire ; on tolère un chemin mal formé (=> refus).
create or replace function public.fn_can_read_avatar(p_object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  begin
    v_owner := (string_to_array(p_object_name, '/'))[1]::uuid;
  exception when others then
    return false;
  end;
  return auth.uid() is not null and not public.fn_is_blocked_between(auth.uid(), v_owner);
end;
$$;

revoke execute on function public.fn_can_read_avatar(text) from public, anon;
grant execute on function public.fn_can_read_avatar(text) to authenticated, service_role;

create policy avatars_read on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and public.fn_can_read_avatar(name));

-- Écriture : uniquement la propriétaire du dossier, et uniquement le fichier unique `profile.jpg`.
create policy avatars_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '/profile.jpg');

create policy avatars_update_own on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '/profile.jpg')
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '/profile.jpg');

create policy avatars_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '/profile.jpg');

-- ===========================================================================
-- Realtime : un canal par plan (`plan:{plan_id}`), abonné aux INSERT sur `messages` filtrés par plan_id.
-- L'autorisation est déléguée à la RLS de `messages` (membres du plan, compte actif, blocages respectés).
-- Seule la table `messages` est répliquée : pas de messagerie sociale générale.
-- ===========================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
     )
  then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
