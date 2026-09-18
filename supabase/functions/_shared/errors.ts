// Contrat d'erreur des Edge Functions — Technical Blueprint V1.3 §23.
// Corps JSON structuré `{ error: { code, message } }` avec des codes STABLES ; jamais de message Postgres brut.
// Ces codes sont miroirs de `src/types/errors.ts` (app mobile) : les garder synchronisés.
import { corsHeaders } from './cors.ts';

export type ErrorCode =
  | 'account_not_ready'
  | 'under_review'
  | 'account_restricted'
  | 'max_active_plans'
  | 'plan_full'
  | 'plan_not_active'
  | 'already_blocked'
  | 'already_participating'
  | 'forbidden'
  | 'unauthorized'
  | 'not_found'
  | 'invalid_request'
  | 'not_implemented'
  | 'internal';

const STATUS: Record<ErrorCode, number> = {
  account_not_ready: 403,
  under_review: 403,
  account_restricted: 403,
  max_active_plans: 409,
  plan_full: 409,
  plan_not_active: 409,
  already_blocked: 403,
  already_participating: 409,
  forbidden: 403,
  unauthorized: 401,
  not_found: 404,
  invalid_request: 400,
  not_implemented: 501,
  internal: 500,
};

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(code: ErrorCode, message?: string): Response {
  return jsonResponse({ error: { code, message: message ?? code } }, STATUS[code]);
}
