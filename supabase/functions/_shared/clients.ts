// Clients Supabase des Edge Functions. `SUPABASE_SERVICE_ROLE_KEY` vit UNIQUEMENT ici (secret serveur, jamais dans l'app).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = () => Deno.env.get('SUPABASE_URL') ?? '';

/** Client agissant AU NOM de l'appelante (RLS appliquée). */
export function createUserClient(req: Request): SupabaseClient {
  return createClient(url(), Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  });
}

/** Client service (bypass RLS) — à n'utiliser qu'après avoir revérifié toutes les règles métier. */
export function createServiceClient(): SupabaseClient {
  return createClient(url(), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { persistSession: false },
  });
}
