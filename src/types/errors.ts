/**
 * Codes d'erreur STABLES (Technical Blueprint V1.3 §23) — miroir de supabase/functions/_shared/errors.ts.
 * Le texte affiché à l'utilisatrice est résolu par `src/i18n/errors.ts` (jamais de message Postgres brut).
 */
export const ERROR_CODES = [
  // règles serveur (Edge Functions / RLS)
  'account_not_ready',
  'under_review',
  'account_restricted',
  'max_active_plans',
  'plan_full',
  'plan_not_active',
  'already_blocked',
  'already_participating',
  'forbidden',
  'unauthorized',
  'not_found',
  'invalid_request',
  'not_implemented',
  // authentification (Apple / Google)
  'auth_cancelled',
  'auth_failed',
  'auth_unavailable',
  // permissions et technique
  'photo_upload_failed',
  'network',
  'unknown',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface AppError {
  code: ErrorCode;
  /** Détail technique pour les logs — jamais affiché tel quel. */
  message?: string;
}

export const appError = (code: ErrorCode, message?: string): AppError =>
  message === undefined ? { code } : { code, message };
