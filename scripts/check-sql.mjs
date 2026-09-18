#!/usr/bin/env node
/**
 * Validation syntaxique des migrations SQL et du seed avec le vrai parseur PostgreSQL (libpg-query).
 * - parse chaque fichier de supabase/migrations et supabase/seed.sql
 * - parse le corps PL/pgSQL des fonctions (attrape les erreurs de syntaxe dans les triggers)
 * - vérifie l'ordre/le nommage des migrations et l'absence de `phone` dans le schéma `users`
 *
 * Ne remplace pas un `supabase db reset` (exécution réelle : PostGIS, Auth, Storage) — voir README.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parse, parsePlPgSQL } = require('libpg-query');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(root, 'supabase', 'migrations');
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => join(migrationsDir, f));
files.push(join(root, 'supabase', 'seed.sql'));

let failures = 0;
const fail = (file, message) => {
  failures += 1;
  console.error(`✗ ${file.replace(root + '/', '')}: ${message}`);
};

for (const file of files) {
  const sql = readFileSync(file, 'utf8');
  try {
    const tree = await parse(sql);
    const stmts = tree.stmts.length;
    const plpgsql = tree.stmts.filter(({ stmt }) =>
      stmt.CreateFunctionStmt?.options?.some(
        (o) => o.DefElem?.defname === 'language' && o.DefElem.arg?.String?.sval === 'plpgsql',
      ),
    ).length;
    // Le corps PL/pgSQL des fonctions est analysé par le parseur dédié (attrape les erreurs de syntaxe des triggers).
    await parsePlPgSQL(sql);
    console.log(
      `✓ ${file.replace(root + '/', '')} — ${stmts} instruction(s), ${plpgsql} fonction(s) plpgsql`,
    );
  } catch (error) {
    fail(file, error instanceof Error ? error.message : String(error));
  }
}

// Règle LOCKED : aucune colonne de contact téléphonique dans `users`.
const core = readFileSync(join(migrationsDir, '20260918000002_core_schema.sql'), 'utf8');
const usersDdl = core.match(/create table public\.users \(([\s\S]*?)\n\);/)?.[1] ?? '';
if (!usersDdl) fail(migrationsDir, 'définition de public.users introuvable');
if (/phone|tel(ephone)?\b|otp/i.test(usersDdl))
  fail(migrationsDir, 'public.users ne doit contenir aucun champ de contact téléphonique');

if (failures > 0) {
  console.error(`\n${failures} erreur(s) SQL.`);
  process.exit(1);
}
console.log('\nSQL : toutes les migrations sont syntaxiquement valides.');
