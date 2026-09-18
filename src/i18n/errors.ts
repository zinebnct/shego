/**
 * Mapping `code d'erreur → clé i18n` centralisé (Technical Blueprint V1.3 §23) : les formulations LOCKED
 * (ex. « Ajoute une photo pour pouvoir créer ou rejoindre un plan. ») ne sont jamais dupliquées dans un écran.
 */
import { i18n } from './index';
import type { ErrorCode } from '@/types/errors';

export const ERROR_MESSAGE_KEYS = {
  account_not_ready: 'errors.account_not_ready',
  under_review: 'errors.under_review',
  account_restricted: 'errors.account_restricted',
  max_active_plans: 'errors.max_active_plans',
  plan_full: 'errors.plan_full',
  plan_not_active: 'errors.plan_not_active',
  already_blocked: 'errors.already_blocked',
  already_participating: 'errors.already_participating',
  forbidden: 'errors.forbidden',
  unauthorized: 'errors.unauthorized',
  not_found: 'errors.not_found',
  invalid_request: 'errors.invalid_request',
  not_implemented: 'errors.not_implemented',
  auth_cancelled: 'errors.auth_cancelled',
  auth_failed: 'errors.auth_failed',
  auth_unavailable: 'errors.auth_unavailable',
  photo_upload_failed: 'errors.photo_upload_failed',
  network: 'errors.network',
  unknown: 'errors.unknown',
} as const satisfies Record<ErrorCode, `errors.${ErrorCode}`>;

/** Texte utilisateur pour un code d'erreur. */
export const errorMessage = (code: ErrorCode): string => i18n.t(ERROR_MESSAGE_KEYS[code]);
