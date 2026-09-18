-- SHEGO — données de DÉVELOPPEMENT uniquement (jamais appliquées en staging/production).
-- Chargées par `supabase db reset`. Les données de référence (villes, catégories, app_config) viennent de la
-- migration 8. Comptes et plans fictifs pour tester la condition d'accès, `under_review` et l'adresse exacte.

set search_path = public, extensions;

-- 3 comptes fictifs (un par cas de test) : le trigger `trg_on_auth_user_created` crée les lignes public.users.
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-00000000000a', 'authenticated', 'authenticated',
   'creatrice@seed.shego.invalid', '{"provider":"apple","providers":["apple"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-00000000000b', 'authenticated', 'authenticated',
   'participante@seed.shego.invalid', '{"provider":"google","providers":["google"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-00000000000c', 'authenticated', 'authenticated',
   'enexamen@seed.shego.invalid', '{"provider":"google","providers":["google"]}', '{}', now(), now())
on conflict (id) do nothing;

-- Profils complets (compte prêt). Le fichier photo n'existe pas dans Storage en dev : seul le chemin compte.
update public.users u
set prenom = v.prenom,
    date_naissance = date '1995-06-15',
    ville_id = (select id from public.cities where cle = 'casablanca'),
    photo_url = u.id::text || '/profile.jpg',
    bio = v.bio,
    account_status = v.status
from (values
  ('00000000-0000-4000-8000-00000000000a'::uuid, 'Salma',  'Café, balades et cinéma.', 'active'),
  ('00000000-0000-4000-8000-00000000000b'::uuid, 'Yasmine', null,                      'active'),
  ('00000000-0000-4000-8000-00000000000c'::uuid, 'Nadia',   null,                      'under_review')
) as v(id, prenom, bio, status)
where u.id = v.id;

-- Plans fictifs à Casablanca (Gauthier, Maârif, Ain Diab).
insert into public.plans
  (id, creator_id, categorie_cle, titre, description, lieu, lieu_public, quartier, adresse_exacte,
   date_heure, places_max, participation_mode, city_id)
select v.id, '00000000-0000-4000-8000-00000000000a', v.categorie, v.titre, v.description,
       ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326)::geography, v.lieu_public, v.quartier, v.adresse,
       now() + v.delai, v.places, v.mode, (select id from public.cities where cle = 'casablanca')
from (values
  ('00000000-0000-4000-8000-0000000000a1'::uuid, 'cafe',   'Café à Gauthier',            null,
     -7.6322, 33.5895, 'Café Bianca — Gauthier', 'Gauthier', '12 rue fictive, 2e étage (données de dev)',
     interval '1 hour', 4::smallint, 'auto'),
  ('00000000-0000-4000-8000-0000000000a2'::uuid, 'balade', 'Balade sur la Corniche',     'Départ devant l''entrée principale.',
     -7.6774, 33.5943, 'Corniche Ain Diab', 'Ain Diab', 'Entrée nord de la Corniche (données de dev)',
     interval '1 day', 6::smallint, 'request'),
  ('00000000-0000-4000-8000-0000000000a3'::uuid, 'sport',  'Pilates à 18h, qui vient ?', null,
     -7.6187, 33.5731, 'Studio Pilates — Maârif', 'Maârif', '3 rue fictive, Maârif (données de dev)',
     interval '3 hours', 8::smallint, 'auto')
) as v(id, categorie, titre, description, lng, lat, lieu_public, quartier, adresse, delai, places, mode)
on conflict (id) do nothing;

-- Une participante acceptée sur le plan « Café à Gauthier » : accès au chat et à l'adresse exacte.
insert into public.plan_participants (plan_id, user_id, status, responded_at)
values ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-00000000000b', 'accepted', now())
on conflict (plan_id, user_id) do nothing;
