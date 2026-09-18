/**
 * Test d'intégration SQL : applique les 8 migrations sur un vrai PostgreSQL embarqué et vérifie RLS, privilèges,
 * triggers et tâches planifiées (Technical Blueprint §29).
 *
 * LIMITES ASSUMÉES : PostGIS, Supabase Auth et Storage sont remplacés par des shims minimalistes
 * (types/fonctions ST_* simplifiés, auth.uid()/auth.jwt() lus dans `request.jwt.claims`). Ce test valide la logique
 * SQL de SHEGO ; il ne remplace pas `supabase db reset` + un run contre l'instance locale Supabase.
 *
 * Usage (dépendances volontairement hors package.json — binaires PostgreSQL ~40 Mo) :
 *   npm install --no-save embedded-postgres pg
 *   node supabase/tests/rls-smoke.mjs
 */
import EmbeddedPostgres from 'embedded-postgres';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = join(tmpdir(), 'shego-rls-smoke');
rmSync(dir, { recursive: true, force: true });
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: 'postgres',
  password: 'pw',
  port: 54329,
  persistent: false,
});
await pg.initialise();
await pg.start();
await pg.createDatabase('shego');
const c = pg.getPgClient('shego');
await c.connect();

const shims = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema extensions; create schema auth; create schema storage;
grant usage on schema public, extensions, auth, storage to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
create table auth.users (id uuid primary key, instance_id uuid, aud text, role text, email text,
  raw_app_meta_data jsonb default '{}', raw_user_meta_data jsonb default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now());
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text, name text, owner uuid);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
create publication supabase_realtime;
create domain extensions.geography as text;
create function extensions.ST_MakePoint(x double precision, y double precision) returns text language sql immutable as $$ select x::text||','||y::text $$;
create function extensions.ST_SetSRID(g text, srid int) returns text language sql immutable as $$ select g $$;
create function extensions.ST_Distance(a text, b text) returns double precision language sql immutable as $$
  select sqrt(power(split_part(a,',',1)::float - split_part(b,',',1)::float,2) + power(split_part(a,',',2)::float - split_part(b,',',2)::float,2)) * 111000 $$;
create function extensions.ST_DWithin(a text, b text, r double precision) returns boolean language sql immutable as $$ select extensions.ST_Distance(a,b) <= r $$;
`;
await c.query(shims);

const files = readdirSync(join(REPO, 'supabase/migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort();
for (const f of files) {
  let sql = readFileSync(join(REPO, 'supabase/migrations', f), 'utf8');
  sql = sql
    .replace(/create extension if not exists (pgcrypto|postgis)[^;]*;/g, '')
    .replace(/geography\(Point, 4326\)/g, 'geography')
    .replace(/create index idx_plans_lieu_gist[^;]*;/g, '');
  try {
    await c.query(sql);
    console.log('applied', f);
  } catch (e) {
    console.error('FAILED', f, e.message, e.position ?? '');
    process.exit(1);
  }
}

// ---------- helpers ----------
let pass = 0,
  fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) {
    pass++;
    console.log('  ✓', name);
  } else {
    fail++;
    console.log('  ✗', name, extra);
  }
};
const as = async (uid, fn, admin = false) => {
  await c.query('reset role');
  const claims = uid
    ? { sub: uid, role: 'authenticated', ...(admin ? { app_metadata: { role: 'admin' } } : {}) }
    : {};
  await c.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify(claims)]);
  await c.query('set role authenticated');
  try {
    return await fn();
  } finally {
    await c.query('reset role');
    await c.query(`select set_config('request.jwt.claims','',false)`);
  }
};
const tryq = async (sql, params) => {
  try {
    const r = await c.query(sql, params);
    return { rows: r.rows, count: r.rowCount };
  } catch (e) {
    return { error: e };
  }
};
const su = (sql, params) => c.query(sql, params);

const A = '00000000-0000-4000-8000-00000000000a',
  B = '00000000-0000-4000-8000-00000000000b',
  C = '00000000-0000-4000-8000-00000000000c',
  D = '00000000-0000-4000-8000-00000000000d';
const R1 = '00000000-0000-4000-8000-0000000000e1',
  R2 = '00000000-0000-4000-8000-0000000000e2',
  R3 = '00000000-0000-4000-8000-0000000000e3',
  R4 = '00000000-0000-4000-8000-0000000000e4';

// users: A créatrice, B participante, C under_review, D autre, R1..R4 reporters
for (const [id, prov] of [
  [A, 'apple'],
  [B, 'google'],
  [C, 'google'],
  [D, 'apple'],
  [R1, 'google'],
  [R2, 'google'],
  [R3, 'google'],
  [R4, 'google'],
]) {
  await su(`insert into auth.users (id, raw_app_meta_data) values ($1, $2)`, [
    id,
    JSON.stringify({ provider: prov }),
  ]);
}
ok(
  'trigger auth.users → public.users',
  (await su('select count(*)::int n from public.users')).rows[0].n === 8,
);
await su(`update public.users u set prenom = 'User'||right(u.id::text,1), date_naissance = '1995-06-15',
  ville_id = (select id from public.cities limit 1), photo_url = u.id::text||'/profile.jpg'`);
await su(`update public.users set account_status='under_review' where id = $1`, [C]);
const city = (await su('select id from public.cities')).rows[0].id;
ok(
  'notification moderation sur changement de statut',
  (
    await su(
      `select count(*)::int n from notifications where user_id=$1 and type='moderation' and payload->>'account_status'='under_review'`,
      [C],
    )
  ).rows[0].n === 1,
);

const insertPlan = (uid, titre) =>
  tryq(
    `insert into public.plans (creator_id, categorie_cle, titre, lieu, lieu_public, quartier, adresse_exacte, date_heure, places_max, participation_mode, city_id)
  values ($1,'cafe',$2, ST_SetSRID(ST_MakePoint(-7.63,33.58),4326)::geography,'Café Bianca — Gauthier','Gauthier','12 rue secrète', now() + interval '2 hours', 4, 'auto', $3)`,
    [uid, titre, city],
  );

console.log('\n[Plans / accès]');
ok('under_review ne peut pas créer un plan', !!(await as(C, () => insertPlan(C, 'x'))).error);
ok('compte prêt peut créer un plan', !(await as(A, () => insertPlan(A, 'P1'))).error);
ok(
  'compte sans photo ne peut pas créer',
  !!(
    (await as(D, async () => {
      await su('reset role');
      return 1;
    })) &&
    (
      await (async () => {
        await su(`update public.users set photo_url=null where id=$1`, [D]);
        const r = await as(D, () => insertPlan(D, 'x'));
        await su(`update public.users set photo_url=id::text||'/profile.jpg' where id=$1`, [D]);
        return r;
      })()
    ).error
  ),
);
await as(A, () => insertPlan(A, 'P2'));
await as(A, () => insertPlan(A, 'P3'));
const r4 = await as(A, () => insertPlan(A, 'P4'));
ok(
  '4e plan actif refusé (max_active_plans_reached)',
  r4.error?.message.includes('max_active_plans_reached'),
  r4.error?.message,
);
const planId = (await su(`select id from plans where titre='P1'`)).rows[0].id;

console.log('\n[Adresse exacte — règle 15.1]');
ok(
  'select adresse_exacte sur plans refusé',
  !!(await as(B, () => tryq('select adresse_exacte from public.plans'))).error,
);
ok('select * sur plans refusé', !!(await as(B, () => tryq('select * from public.plans'))).error);
const pub = await as(B, () => tryq('select * from public.plans_public'));
ok(
  'plans_public lisible sans adresse_exacte',
  !pub.error && pub.rows.length === 3 && !('adresse_exacte' in pub.rows[0]),
);
ok(
  'plans_full vide pour non-participante',
  (await as(B, () => tryq('select * from public.plans_full where id=$1', [planId]))).rows.length ===
    0,
);
ok(
  'plans_full visible pour la créatrice',
  (await as(A, () => tryq('select adresse_exacte from public.plans_full where id=$1', [planId])))
    .rows[0]?.adresse_exacte === '12 rue secrète',
);

console.log('\n[Participation]');
ok(
  'B ne peut pas s’insérer en `accepted`',
  !!(
    await as(B, () =>
      tryq(`insert into plan_participants (plan_id,user_id,status) values ($1,$2,'accepted')`, [
        planId,
        B,
      ]),
    )
  ).error,
);
ok(
  'under_review ne peut pas demander à rejoindre',
  !!(
    await as(C, () =>
      tryq(`insert into plan_participants (plan_id,user_id,status) values ($1,$2,'pending')`, [
        planId,
        C,
      ]),
    )
  ).error,
);
ok(
  'B peut demander (pending)',
  !(
    await as(B, () =>
      tryq(`insert into plan_participants (plan_id,user_id,status) values ($1,$2,'pending')`, [
        planId,
        B,
      ]),
    )
  ).error,
);
ok(
  'notification join_request pour la créatrice',
  (
    await su(
      `select count(*)::int n from notifications where user_id=$1 and type='join_request' and payload->>'requester_prenom'='Userb'`,
      [A],
    )
  ).rows[0].n === 1,
);
ok(
  'plans_full toujours vide pour B en pending',
  (await as(B, () => tryq('select 1 from public.plans_full where id=$1', [planId]))).rows.length ===
    0,
);
ok(
  'B en pending ne peut pas lire les messages',
  (await as(B, () => tryq('select 1 from messages where plan_id=$1', [planId]))).rows.length === 0,
);
await su(`update plan_participants set status='accepted' where plan_id=$1 and user_id=$2`, [
  planId,
  B,
]);
ok(
  'notification request_accepted',
  (
    await su(
      `select count(*)::int n from notifications where user_id=$1 and type='request_accepted'`,
      [B],
    )
  ).rows[0].n === 1,
);
ok(
  'plans_full visible pour B acceptée',
  (await as(B, () => tryq('select adresse_exacte from public.plans_full where id=$1', [planId])))
    .rows[0]?.adresse_exacte === '12 rue secrète',
);

console.log('\n[Chat]');
const sendMsg = (uid, txt) =>
  tryq(`insert into messages (plan_id, sender_id, contenu, type) values ($1,$2,$3,'user')`, [
    planId,
    uid,
    txt,
  ]);
ok('membre accepté peut écrire', !(await as(B, () => sendMsg(B, 'coucou'))).error);
ok('non-membre ne peut pas écrire', !!(await as(D, () => sendMsg(D, 'intrus'))).error);
ok('usurpation de sender_id refusée', !!(await as(B, () => sendMsg(A, 'fake'))).error);
ok(
  'message système interdit côté client',
  !!(
    await as(B, () =>
      tryq(`insert into messages (plan_id, sender_id, contenu, type) values ($1,$2,'x','system')`, [
        planId,
        B,
      ]),
    )
  ).error,
);
ok(
  'notification new_message pour la créatrice',
  (await su(`select payload from notifications where user_id=$1 and type='new_message'`, [A]))
    .rows[0]?.payload?.preview === 'coucou',
);
ok(
  'non-membre ne lit pas le chat',
  (await as(D, () => tryq('select 1 from messages where plan_id=$1', [planId]))).rows.length === 0,
);
ok(
  'créatrice lit le chat',
  (await as(A, () => tryq('select 1 from messages where plan_id=$1', [planId]))).rows.length === 1,
);
await su(`update public.users set account_status='under_review' where id=$1`, [B]);
ok('under_review : plus d’écriture dans le chat', !!(await as(B, () => sendMsg(B, 'x2'))).error);
ok(
  'under_review : plus de lecture du chat',
  (await as(B, () => tryq('select 1 from messages where plan_id=$1', [planId]))).rows.length === 0,
);
await su(`update public.users set account_status='active' where id=$1`, [B]);

console.log('\n[Profils / users]');
ok(
  'account_status non modifiable par le client',
  !!(await as(C, () => tryq(`update users set account_status='active' where id=$1`, [C]))).error,
);
ok(
  'auth_provider non modifiable',
  !!(await as(B, () => tryq(`update users set auth_provider='apple' where id=$1`, [B]))).error,
);
ok(
  'prenom modifiable',
  !(await as(B, () => tryq(`update users set prenom='Bea' where id=$1`, [B]))).error,
);
ok(
  'photo_url doit être le chemin propre',
  !!(await as(B, () => tryq(`update users set photo_url='https://evil/x.jpg' where id=$1`, [B])))
    .error,
);
ok(
  'users : pas de lecture d’un autre profil',
  (await as(B, () => tryq('select 1 from users where id=$1', [A]))).rows.length === 0,
);
const pp = await as(B, () => tryq('select * from public_profiles where id=$1', [A]));
ok(
  'public_profiles : créatrice visible avec âge, sans date de naissance',
  pp.rows.length === 1 &&
    pp.rows[0].age >= 28 &&
    !('date_naissance' in pp.rows[0]) &&
    !('push_token' in pp.rows[0]),
);
ok(
  'public_profiles : inconnue (D) invisible pour B',
  (await as(B, () => tryq('select 1 from public_profiles where id=$1', [D]))).rows.length === 0,
);
ok(
  'public_profiles : créatrice voit la participante',
  (await as(A, () => tryq('select 1 from public_profiles where id=$1', [B]))).rows.length === 1,
);

console.log('\n[Signalements / modération]');
ok(
  'auto-signalement refusé',
  !!(
    await as(R1, () =>
      tryq(
        `insert into reports (reporter_id,target_type,target_id,motif) values ($1,'user',$1,'autre')`,
        [R1],
      ),
    )
  ).error,
);
ok(
  'reporter ne peut pas fixer status',
  !!(
    await as(R1, () =>
      tryq(
        `insert into reports (reporter_id,target_type,target_id,motif,status) values ($1,'user',$2,'autre','traite')`,
        [R1, D],
      ),
    )
  ).error,
);
for (const r of [R1, R2])
  await as(r, () =>
    tryq(
      `insert into reports (reporter_id,target_type,target_id,motif) values ($1,'user',$2,'harcelement')`,
      [r, D],
    ),
  );
ok(
  '2 signalements : toujours active',
  (await su('select account_status s from users where id=$1', [D])).rows[0].s === 'active',
);
for (const r of [R3, R4])
  await as(r, () =>
    tryq(
      `insert into reports (reporter_id,target_type,target_id,motif) values ($1,'user',$2,'harcelement')`,
      [r, D],
    ),
  );
ok(
  '3e signalement distinct → under_review',
  (await su('select account_status s from users where id=$1', [D])).rows[0].s === 'under_review',
);
ok(
  'journal d’audit : une seule entrée automatique',
  (
    await su(
      `select count(*)::int n from moderation_actions where target_user_id=$1 and is_automatic`,
      [D],
    )
  ).rows[0].n === 1,
);
ok(
  'moderation_actions illisible pour un non-admin',
  (await as(B, () => tryq('select 1 from moderation_actions'))).rows.length === 0,
);
ok(
  'moderation_actions lisible pour un admin',
  (await as(B, () => tryq('select 1 from moderation_actions'), true)).rows.length === 1,
);
ok(
  'behavior_signals inaccessible',
  !!(await as(B, () => tryq('select 1 from behavior_signals'))).error,
);
await su(`update users set account_status='active' where id=$1`, [D]);

console.log('\n[Blocages]');
ok(
  'B bloque la créatrice A',
  !(await as(B, () => tryq(`insert into blocks (blocker_id, blocked_id) values ($1,$2)`, [B, A])))
    .error,
);
ok(
  'trigger : participation de B retirée',
  (await su(`select status from plan_participants where plan_id=$1 and user_id=$2`, [planId, B]))
    .rows[0].status === 'removed',
);
ok(
  'B ne voit plus le plan de A',
  (await as(B, () => tryq('select 1 from plans_public where id=$1', [planId]))).rows.length === 0,
);
ok(
  'A (bloquée) ne voit plus le profil de B',
  (await as(A, () => tryq('select 1 from public_profiles where id=$1', [B]))).rows.length === 0,
);
ok(
  'blocage bilatéral : A ne voit pas les plans… (B ne crée pas ici) — profil de A invisible pour B',
  (await as(B, () => tryq('select 1 from public_profiles where id=$1', [A]))).rows.length === 0,
);
ok(
  'fn_list_blocked renvoie A',
  (await as(B, () => tryq('select * from fn_list_blocked()'))).rows[0]?.blocked_id === A,
);
ok(
  'déblocage possible',
  (await as(B, () => tryq(`delete from blocks where blocker_id=$1 and blocked_id=$2`, [B, A])))
    .count === 1,
);

console.log('\n[Notifications / config / découverte / storage]');
ok(
  'notification : seule `lu` modifiable',
  !!(await as(A, () => tryq(`update notifications set payload='{}' where user_id=$1`, [A]))).error,
);
ok(
  'notification : `lu` modifiable',
  !(await as(A, () => tryq(`update notifications set lu=true where user_id=$1`, [A]))).error,
);
ok(
  'plan : UPDATE client refusé (Edge Functions)',
  !!(await as(A, () => tryq(`update plans set places_max=10 where id=$1`, [planId]))).error,
);
ok(
  'app_config : une seule clé publique',
  (await as(A, () => tryq('select cle from app_config'))).rows.map((r) => r.cle).join() ===
    'category_default_modes',
);
const disc = await as(A, () =>
  tryq(`select * from fn_discover_plans(33.58, -7.63, $1, null, 30)`, [city]),
);
ok(
  'fn_discover_plans (shim PostGIS) exécutable et sans doublon',
  !disc.error && disc.rows.length === new Set(disc.rows.map((r) => r.plan_id)).size,
  disc.error?.message,
);
ok(
  'fn_discover_plans : ville entière (volume cible non atteint)',
  !disc.error && disc.rows.length === 3,
);
ok(
  'bucket avatars privé, jpeg',
  (await su(`select public, allowed_mime_types from storage.buckets where id='avatars'`)).rows[0]
    .public === false,
);
ok(
  'fn_can_read_avatar : chemin invalide refusé',
  (await as(A, () => tryq(`select fn_can_read_avatar('not-a-uuid/x') ok`))).rows[0].ok === false,
);
ok(
  'fn_can_read_avatar : photo non bloquée lisible',
  (await as(A, () => tryq(`select fn_can_read_avatar($1 || '/profile.jpg') ok`, [B]))).rows[0]
    .ok === true,
);
ok(
  'anon : aucun accès aux tables',
  !!(
    await (async () => {
      await c.query('set role anon');
      const r = await tryq('select 1 from public.plans_public');
      await c.query('reset role');
      return r;
    })()
  ).error,
);

console.log('\n[Planificateur]');
await su(
  `insert into plan_participants (plan_id,user_id,status) values ($1,$2,'accepted') on conflict (plan_id,user_id) do update set status='accepted'`,
  [planId, B],
);
await su(`insert into plan_participants (plan_id,user_id,status) values ($1,$2,'pending')`, [
  planId,
  D,
]);
// plan qui démarre dans 60 min → rappel ; plan vieux de 25 h → archivé ; demande pending d'un plan démarré → expirée
await su(`update plans set date_heure = now() + interval '60 minutes' where id=$1`, [planId]);
await su(`select fn_run_scheduled_tasks()`);
ok(
  'rappel plan_reminder créé pour la participante (sans adresse exacte)',
  (await su(`select payload from notifications where user_id=$1 and type='plan_reminder'`, [B]))
    .rows.length === 1 &&
    !JSON.stringify(
      (await su(`select payload from notifications where type='plan_reminder'`)).rows,
    ).includes('secrète'),
);
await su(`select fn_run_scheduled_tasks()`);
ok(
  'rappel non dupliqué au tick suivant',
  (
    await su(
      `select count(*)::int n from notifications where user_id=$1 and type='plan_reminder'`,
      [B],
    )
  ).rows[0].n === 1,
);
await su(`alter table plans disable trigger user`);
await su(
  `update plans set created_at = now() - interval '2 days', date_heure = now() - interval '25 hours' where id=$1`,
  [planId],
);
await su(`alter table plans enable trigger user`);
await su(`select fn_run_scheduled_tasks()`);
ok(
  'plan passé archivé (24 h)',
  (await su(`select status from plans where id=$1`, [planId])).rows[0].status === 'passe',
);
ok(
  'demande pending expirée → declined',
  (await su(`select status from plan_participants where plan_id=$1 and user_id=$2`, [planId, D]))
    .rows[0].status === 'declined',
);
ok(
  'notification request_declined (neutre) pour la demandeuse',
  (
    await su(
      `select count(*)::int n from notifications where user_id=$1 and type='request_declined'`,
      [D],
    )
  ).rows[0].n === 1,
);
await su(`update plan_participants set status='accepted' where plan_id=$1 and user_id=$2`, [
  planId,
  B,
]);
ok(
  'chat archivé : écriture refusée sur plan passé',
  !!(
    await as(B, () =>
      tryq(
        `insert into messages (plan_id, sender_id, contenu, type) values ($1,$2,'trop tard','user')`,
        [planId, B],
      ),
    )
  ).error,
);
ok(
  'chat archivé : lecture seule conservée',
  (await as(B, () => tryq('select 1 from messages where plan_id=$1', [planId]))).rows.length >= 1,
);
ok(
  'plan passé toujours visible via plans_public pour la participante',
  (await as(B, () => tryq('select 1 from plans_public where id=$1', [planId]))).rows.length === 1,
);

console.log(`\n${pass} ok, ${fail} échec(s)`);
await c.end();
await pg.stop();
process.exit(fail ? 1 : 0);
