-- SHEGO — Migration 1/8 : extensions
-- Source : Technical Blueprint V1.3 §6, §9.
-- PostGIS et pgcrypto sont installées dans le schéma `extensions` (convention Supabase).
-- Les migrations suivantes fixent `search_path = public, extensions` quand elles utilisent `geography`.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis with schema extensions;
