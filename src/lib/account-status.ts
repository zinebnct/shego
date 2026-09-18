/**
 * SOURCE UNIQUE des règles liées à `account_status` côté client (Blueprint produit §6.3, §6.4bis — LOCKED).
 *
 *   active        → accès complet, sous réserve de la condition d'accès (voir `account-readiness.ts`)
 *   under_review  → AUCUN Create, AUCUN Join, AUCUN Chat (règle binaire, sans nuance de gravité en V1)
 *   suspended     → accès bloqué, réversible
 *   banned        → accès bloqué, définitif
 *
 * Aucun autre fichier ne doit comparer `account_status` à une valeur littérale : il importe ces helpers.
 * (Le serveur reste la barrière réelle : RLS + Edge Functions — voir supabase/migrations, fn_is_account_ready.)
 */
export const ACCOUNT_STATUSES = ['active', 'under_review', 'suspended', 'banned'] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const isAccountStatus = (value: unknown): value is AccountStatus =>
  typeof value === 'string' && (ACCOUNT_STATUSES as readonly string[]).includes(value);

/** Create / Join / Chat ne sont permis que pour un compte `active`. */
export const canCreateJoinChat = (status: AccountStatus): boolean => status === 'active';

export const isUnderReview = (status: AccountStatus): boolean => status === 'under_review';

/** suspended | banned : accès bloqué, écran dédié hors Home/Create/Chat (Design System §14). */
export const isAccessBlocked = (status: AccountStatus): boolean =>
  status === 'suspended' || status === 'banned';
