// Enveloppe commune des Edge Functions : CORS, authentification, garde « compte prêt », erreurs structurées.
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { corsHeaders } from './cors.ts';
import { AppError, errorResponse, jsonResponse } from './errors.ts';
import { createServiceClient, createUserClient } from './clients.ts';
import { assertAccountReady } from './account.ts';

export interface HandlerContext<TBody = unknown> {
  req: Request;
  body: TBody;
  /** Absent pour `auth: 'service'` (déclencheurs internes : webhook DB, scheduler). */
  user: User | null;
  userClient: SupabaseClient;
  serviceClient: SupabaseClient;
}

export interface FunctionOptions {
  /** `user` (défaut) : session Apple/Google valide · `admin` : + claim app_metadata.role = 'admin' · `service` : clé service. */
  auth?: 'user' | 'admin' | 'service';
  /** Revérifie la condition d'accès LOCKED (session, prénom, 18+, ville, photo, account_status = active). */
  requireAccountReady?: boolean;
}

export function serveFunction<TBody = unknown>(
  name: string,
  options: FunctionOptions,
  handler: (ctx: HandlerContext<TBody>) => Promise<unknown>,
): void {
  Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return errorResponse('invalid_request', 'POST requis');

    try {
      const serviceClient = createServiceClient();
      const userClient = createUserClient(req);
      let user: User | null = null;

      if (options.auth === 'service') {
        const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer /, '');
        if (!token || token !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
          throw new AppError('unauthorized');
      } else {
        const { data, error } = await userClient.auth.getUser();
        if (error || !data.user) throw new AppError('unauthorized');
        user = data.user;
        if (options.auth === 'admin' && user.app_metadata?.role !== 'admin')
          throw new AppError('forbidden');
        if (options.requireAccountReady) await assertAccountReady(serviceClient, user.id);
      }

      const body = (await req.json().catch(() => ({}))) as TBody;
      const data = await handler({ req, body, user, userClient, serviceClient });
      return jsonResponse({ data });
    } catch (e) {
      if (e instanceof AppError) return errorResponse(e.code, e.message);
      console.error(`[${name}]`, e); // journal serveur uniquement — jamais renvoyé au client
      return errorResponse('internal');
    }
  });
}

/** Squelette : la logique métier de la fonction sera implémentée dans la phase fonctionnelle correspondante. */
export function notImplemented(name: string): never {
  throw new AppError('not_implemented', `${name} : logique métier à implémenter`);
}
