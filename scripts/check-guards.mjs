#!/usr/bin/env node
/**
 * Garde-fous d'architecture SHEGO — vérifient les règles NON NÉGOCIABLES du repository (exécuté en CI).
 *
 *  1. Aucun terme interdit dans le CODE courant (contact téléphonique, code à usage unique, biométrie, liveness,
 *     reconnaissance faciale, selfie de vérification, CIN/CNIE, badge de vérification, trust score).
 *     Les commentaires sont ignorés : ils peuvent expliquer ce qui est ABSENT. Les specs (docs/) et le README aussi.
 *  2. Aucun secret backend dans l'app mobile (clé service, secrets Apple/Google, clé Places, PEM, JWT service_role).
 *  3. Aucun fichier `.env` réel versionné ; `.env.example` sans valeur secrète.
 *  4. Routes obligatoires du Technical Blueprint §2.
 *  5. Règles `account_status` centralisées (aucune comparaison littérale hors src/lib/account-status.ts ; aucune
 *     condition `account_status` recopiée dans les policies RLS — elles appellent fn_is_account_ready/active).
 *  6. RLS activée sur 100 % des tables (Blueprint §31).
 *  7. Aucun accès direct à Supabase hors src/services et src/lib (Blueprint §2, §21).
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(root, p);
let failures = 0;
const fail = (rule, message) => {
  failures += 1;
  console.error(`✗ [${rule}] ${message}`);
};
const pass = (rule, message) => console.log(`✓ [${rule}] ${message}`);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Retire les commentaires (// … /* … *\/, -- … en SQL, # … en toml/env) avant analyse. */
function stripComments(text, ext) {
  if (['.ts', '.tsx', '.js', '.mjs', '.cjs'].includes(ext)) {
    return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  }
  if (ext === '.sql') return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');
  if (['.toml', '.env', '.example'].includes(ext)) return text.replace(/^\s*#.*$/gm, '');
  return text;
}

const codeDirs = ['app', 'src', join('supabase', 'migrations'), join('supabase', 'functions')];
const codeFiles = [
  ...codeDirs.flatMap((d) => walk(join(root, d))),
  join(root, 'supabase', 'seed.sql'),
  join(root, 'supabase', 'config.toml'),
  join(root, 'app.config.ts'),
  join(root, 'eas.json'),
  join(root, '.env.example'),
  join(root, 'package.json'),
]
  // Les tests peuvent citer un terme interdit pour vérifier son ABSENCE de l'interface (ex. errors.test.ts).
  .filter((f) => existsSync(f) && !/\.(png|jpg|jpeg|ttf|otf)$/.test(f) && !/\.test\.tsx?$/.test(f));

// ---------------------------------------------------------------------------------------------------------
// 1. Termes interdits
// ---------------------------------------------------------------------------------------------------------
const FORBIDDEN = [
  [/\bphone\b/i, 'phone'],
  [/phone_?number/i, 'phone number'],
  [/t[ée]l[ée]phon/i, 'téléphone'],
  [/\botp\b/i, 'OTP'],
  [/\bsms\b/i, 'SMS'],
  [/biom[ée]tr/i, 'biométrie'],
  [/liveness/i, 'liveness'],
  [/face[\s_-]?(id|recogni|detect|match)/i, 'reconnaissance faciale / Face ID'],
  [/reconnaissance faciale/i, 'reconnaissance faciale'],
  [/selfie/i, 'selfie'],
  [/(?<![\p{L}\d])(cin|cnie)(?![\p{L}\d])/iu, 'CIN/CNIE'], // frontières Unicode : « cinéma » n'est pas « CIN »
  [/verified[_\s-]?badge/i, 'badge de vérification'],
  [/is_?verified/i, 'statut vérifié'],
  [/trust[_\s-]?score/i, 'trust score'],
  [/expo-local-authentication|expo-face-detector/, 'module biométrique'],
];
let forbiddenHits = 0;
for (const file of codeFiles) {
  const ext = extname(file);
  const text = stripComments(readFileSync(file, 'utf8'), ext);
  for (const [pattern, label] of FORBIDDEN) {
    if (pattern.test(text)) {
      forbiddenHits += 1;
      fail('interdits', `${rel(file)} contient « ${label} »`);
    }
  }
}
if (forbiddenHits === 0)
  pass('interdits', `aucun terme interdit dans ${codeFiles.length} fichiers de code`);

// ---------------------------------------------------------------------------------------------------------
// 2. Aucun secret backend dans l'app mobile
// ---------------------------------------------------------------------------------------------------------
const mobileFiles = [
  ...walk(join(root, 'app')),
  ...walk(join(root, 'src')),
  join(root, 'app.config.ts'),
  join(root, 'eas.json'),
].filter((f) => existsSync(f));
const SECRET_PATTERNS = [
  [
    /process\.env\.[A-Z_]*(SERVICE_ROLE|PRIVATE_KEY|CLIENT_SECRET|PLACES_API)/,
    'variable secrète lue côté mobile',
  ],
  [/EXPO_PUBLIC_[A-Z_]*(SERVICE_ROLE|SECRET|PRIVATE)/, 'secret exposé via EXPO_PUBLIC_*'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clé privée PEM'],
  [/sb_secret_[A-Za-z0-9_]+/, 'clé secrète Supabase'],
];
let secretHits = 0;
for (const file of mobileFiles) {
  const text = stripComments(readFileSync(file, 'utf8'), extname(file));
  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      secretHits += 1;
      fail('secrets', `${rel(file)} : ${label}`);
    }
  }
  for (const token of text.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*/g) ??
    []) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
      if (payload.role === 'service_role') {
        secretHits += 1;
        fail('secrets', `${rel(file)} : JWT service_role en clair`);
      }
    } catch {
      /* pas un JWT */
    }
  }
}
if (secretHits === 0)
  pass('secrets', `aucun secret backend dans ${mobileFiles.length} fichiers mobiles`);

// ---------------------------------------------------------------------------------------------------------
// 3. Fichiers .env
// ---------------------------------------------------------------------------------------------------------
let tracked = [];
try {
  tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
} catch {
  tracked = [];
}
const trackedEnv = tracked.filter(
  (f) => /(^|\/)\.env(\..+)?$/.test(f) && !f.endsWith('.env.example'),
);
if (trackedEnv.length > 0) fail('env', `fichier(s) .env versionné(s) : ${trackedEnv.join(', ')}`);
else pass('env', 'aucun .env réel versionné');

const ALLOWED_EXAMPLE_VALUES = new Set(['', 'development', 'http://127.0.0.1:54321']);
let exampleOk = true;
for (const line of readFileSync(join(root, '.env.example'), 'utf8').split('\n')) {
  const match = /^([A-Z0-9_]+)=([^#]*)/.exec(line.trim());
  if (!match) continue;
  const value = match[2].trim();
  if (!ALLOWED_EXAMPLE_VALUES.has(value)) {
    exampleOk = false;
    fail('env', `.env.example : ${match[1]} a une valeur (${value.slice(0, 12)}…) — laisser vide`);
  }
}
if (exampleOk) pass('env', '.env.example sans valeur réelle');

// ---------------------------------------------------------------------------------------------------------
// 4. Routes obligatoires (Technical Blueprint §2)
// ---------------------------------------------------------------------------------------------------------
const requiredRoutes = [
  ...[
    'welcome',
    'welcome-confiance',
    'auth',
    'prenom',
    'date-naissance',
    'ville',
    'photo',
    'interets',
    'bio',
    'permissions-notifications',
    'permissions-localisation',
  ].map((n) => `app/(onboarding)/${n}.tsx`),
  ...['home', 'mes-plans', 'messages', 'profil'].map((n) => `app/(tabs)/${n}.tsx`),
  'app/plan/[id]/index.tsx',
  'app/plan/[id]/chat.tsx',
  'app/create-plan.tsx',
  'app/settings/index.tsx',
  'app/_layout.tsx',
];
const missingRoutes = requiredRoutes.filter((r) => !existsSync(join(root, r)));
if (missingRoutes.length > 0) fail('routes', `routes manquantes : ${missingRoutes.join(', ')}`);
else pass('routes', `${requiredRoutes.length} routes obligatoires présentes`);

const requiredFunctions = [
  'onboarding-complete-profile',
  'profile-upload-photo',
  'plans-create',
  'plans-discover',
  'plans-update-capacity',
  'plans-update-location-time',
  'plan-cancel',
  'participation-join',
  'participation-respond',
  'participation-leave',
  'reports-create',
  'blocks-create',
  'moderation-action',
  'notifications-dispatch',
  'account-delete',
  'scheduled-tasks-tick',
];
const missingFns = requiredFunctions.filter(
  (f) => !existsSync(join(root, 'supabase/functions', f, 'index.ts')),
);
if (missingFns.length > 0)
  fail('functions', `Edge Functions manquantes : ${missingFns.join(', ')}`);
else pass('functions', `${requiredFunctions.length} Edge Functions du Blueprint §13 présentes`);

// ---------------------------------------------------------------------------------------------------------
// 5. account_status centralisé
// ---------------------------------------------------------------------------------------------------------
const clientFiles = [...walk(join(root, 'app')), ...walk(join(root, 'src'))].filter((f) =>
  /\.tsx?$/.test(f),
);
const CENTRAL = join(root, 'src/lib/account-status.ts');
let statusHits = 0;
for (const file of clientFiles) {
  if (file === CENTRAL) continue;
  const text = stripComments(readFileSync(file, 'utf8'), extname(file));
  if (
    /account_status\s*[!=]==?\s*['"`]/.test(text) ||
    /['"`](active|under_review|suspended|banned)['"`]\s*[!=]==?\s*[\w.]*account_status/.test(text)
  ) {
    statusHits += 1;
    fail(
      'account_status',
      `${rel(file)} compare account_status à un littéral : utiliser src/lib/account-status.ts`,
    );
  }
}
const rlsFile = join(root, 'supabase/migrations/20260918000004_rls_and_privileges.sql');
if (/account_status/.test(stripComments(readFileSync(rlsFile, 'utf8'), '.sql'))) {
  statusHits += 1;
  fail(
    'account_status',
    'les policies RLS ne doivent pas recopier la condition : utiliser fn_is_account_ready / fn_is_account_active',
  );
}
if (statusHits === 0)
  pass(
    'account_status',
    'règles account_status centralisées (client : src/lib/account-status.ts ; SQL : fn_is_account_*)',
  );

// ---------------------------------------------------------------------------------------------------------
// 6. RLS sur 100 % des tables
// ---------------------------------------------------------------------------------------------------------
const migrationSql = readdirSync(join(root, 'supabase/migrations'))
  .filter((f) => f.endsWith('.sql'))
  .map((f) => stripComments(readFileSync(join(root, 'supabase/migrations', f), 'utf8'), '.sql'))
  .join('\n');
const tables = [...migrationSql.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]);
const noRls = tables.filter(
  (t) => !new RegExp(`alter table public\\.${t}\\s+enable row level security`).test(migrationSql),
);
if (tables.length === 0) fail('rls', 'aucune table trouvée');
else if (noRls.length > 0) fail('rls', `tables sans RLS : ${noRls.join(', ')}`);
else pass('rls', `RLS activée sur les ${tables.length} tables (${tables.join(', ')})`);

// ---------------------------------------------------------------------------------------------------------
// 7. Pas d'accès direct à Supabase hors services/lib
// ---------------------------------------------------------------------------------------------------------
let directHits = 0;
for (const file of clientFiles) {
  const r = rel(file);
  if (r.startsWith('src/services/') || r.startsWith('src/lib/') || r.startsWith('src/types/'))
    continue;
  const text = readFileSync(file, 'utf8');
  const imports = [...text.matchAll(/^import\s+(type\s+)?[^;]*?from\s+['"]([^'"]+)['"]/gm)];
  for (const [, typeOnly, source] of imports) {
    if (typeOnly) continue; // `import type` : aucun code chargé
    if (source.startsWith('@supabase/') || source === '@/lib/supabase') {
      directHits += 1;
      fail('supabase-direct', `${r} importe ${source} : passer par src/services`);
    }
  }
}
if (directHits === 0)
  pass('supabase-direct', 'aucun composant / hook / store / écran n’appelle Supabase directement');

if (failures > 0) {
  console.error(`\n${failures} garde-fou(s) en échec.`);
  process.exit(1);
}
console.log('\nTous les garde-fous passent.');
