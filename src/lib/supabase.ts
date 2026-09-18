/**
 * Client Supabase typé — SEUL point de création du client. Importé UNIQUEMENT par `src/services/*`
 * (règle ESLint : aucun composant, hook ou store n'appelle Supabase directement — Blueprint §21).
 *
 * Sécurité mobile : uniquement l'URL et la clé `anon` (publiques, protégées par la RLS). Jamais de clé service.
 * Auth : flux PKCE ; session persistée dans le Keychain/Keystore ; aucune détection d'URL (pas de web).
 */
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import type { Database } from '@/types/database.types';
import { secureSessionStorage } from './secure-storage';

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  realtime: { params: { eventsPerSecond: 10 } },
});

// Rafraîchissement du jeton uniquement quand l'app est au premier plan (recommandation Supabase pour React Native).
AppState.addEventListener('change', (state) => {
  if (state === 'active') void supabase.auth.startAutoRefresh();
  else void supabase.auth.stopAutoRefresh();
});
