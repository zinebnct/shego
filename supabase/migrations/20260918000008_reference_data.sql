-- SHEGO — Migration 8/8 : données de référence (obligatoires dans tous les environnements)
-- Villes (Casablanca seule active en V1), catégories/intérêts (12, liste fermée) et paramètres serveur.
-- Idempotent : `on conflict do nothing` — les valeurs d'app_config restent ajustables sans redéploiement.

set search_path = public, extensions;

insert into public.cities (cle, nom, actif, centre)
values ('casablanca', 'Casablanca', true, ST_SetSRID(ST_MakePoint(-7.5898, 33.5731), 4326)::geography)
on conflict (cle) do nothing;

-- 12 catégories, ordre = ordre du Blueprint produit §24. Libellés résolus côté client (i18n), stockés par clé.
insert into public.interests (cle, ordre) values
  ('cafe',     1),
  ('brunch',   2),
  ('shopping', 3),
  ('cinema',   4),
  ('sport',    5),
  ('balade',   6),
  ('plage',    7),
  ('concert',  8),
  ('creatif',  9),
  ('voyage',  10),
  ('soiree',  11),
  ('autre',   12)
on conflict (cle) do nothing;

insert into public.app_config (cle, valeur) values
  -- Découverte élastique (Blueprint produit §4.2) — valeurs de départ indicatives, à calibrer avec la beta.
  ('discovery_radii_m',              '[3000, 8000, 20000]'::jsonb),
  ('discovery_target_volume',        '{"volume_cible": 10}'::jsonb),
  -- Safety Layer §7 voie B : nombre de signalements distincts (7 jours) avant under_review automatique.
  ('report_threshold_under_review',  '{"seuil": 3}'::jsonb),
  -- Blueprint §39 : signal `multi_account_device`, collecte uniquement (aucune action automatique en V1).
  ('device_multi_account_threshold', '{"seuil": 3, "fenetre_heures": 24}'::jsonb),
  -- Défaut contextuel de participation par catégorie (Blueprint produit §3.2), modifiable sans redéploiement.
  ('category_default_modes', jsonb_build_object(
      'cafe', 'auto', 'brunch', 'auto', 'shopping', 'auto', 'cinema', 'auto',
      'sport', 'auto', 'balade', 'request', 'plage', 'request', 'concert', 'auto',
      'creatif', 'auto', 'soiree', 'request', 'voyage', 'request', 'autre', 'request'))
on conflict (cle) do nothing;
