import type { AppError } from './errors';

/**
 * Type de retour de TOUTES les fonctions de `src/services` (Technical Blueprint V1.3 §21) :
 * un type discriminé `{ data } | { error }` — jamais d'exception non gérée qui remonterait jusqu'à l'UI.
 */
export type Result<T> = { data: T; error?: undefined } | { data?: undefined; error: AppError };

export const ok = <T>(data: T): Result<T> => ({ data });
export const fail = <T = never>(error: AppError): Result<T> => ({ error });
