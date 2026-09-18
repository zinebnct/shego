/**
 * Variables d'environnement de l'APP MOBILE (Technical Blueprint V1.3 §25-§26).
 *
 * Seules les variables `EXPO_PUBLIC_*` existent côté client — elles sont incluses dans le bundle, donc PUBLIQUES.
 * Les accès `process.env.EXPO_PUBLIC_X` doivent rester littéraux (inlining Expo).
 * `SUPABASE_SERVICE_ROLE_KEY`, les clés Apple et `PLACES_API_KEY` ne doivent JAMAIS apparaître ici :
 * `npm run check:guards` échoue si un secret backend est référencé dans le code mobile.
 */
export type AppEnv = 'development' | 'staging' | 'production';

const APP_ENVS: readonly AppEnv[] = ['development', 'staging', 'production'];

function readAppEnv(value: string | undefined): AppEnv {
  return APP_ENVS.find((e) => e === value) ?? 'development';
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Copier .env.example vers .env.local (voir README).`,
    );
  }
  return value;
}

/** Décode le rôle porté par une clé JWT Supabase (sans vérifier la signature) pour détecter une clé service exposée. */
export function jwtRole(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const role = (JSON.parse(json) as { role?: unknown }).role;
    return typeof role === 'string' ? role : null;
  } catch {
    return null;
  }
}

function build() {
  const appEnv = readAppEnv(process.env.EXPO_PUBLIC_APP_ENV);
  const supabaseUrl = required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = required(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  );

  // Garde-fous « aucun secret backend dans le bundle mobile ».
  if (jwtRole(supabaseAnonKey) === 'service_role') {
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY contient une clé service_role : clé refusée (secret backend).',
    );
  }
  if (appEnv !== 'development' && !supabaseUrl.startsWith('https://')) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL doit être en https hors développement.');
  }

  return {
    appEnv,
    isProduction: appEnv === 'production',
    supabaseUrl,
    supabaseAnonKey,
    /** Identifiants client Google : publics par nature (le secret client reste côté Supabase Auth). */
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB ?? '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS ?? '',
  } as const;
}

export const env = build();
