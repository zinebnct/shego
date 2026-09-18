/**
 * Utilitaires PRIVÉS de la couche services : conversion de toute erreur (Edge Function, PostgREST, Auth, réseau)
 * en `AppError` à code stable (Blueprint §23), et appel typé des Edge Functions.
 * Jamais de message Postgres brut remonté à l'UI.
 */
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ERROR_CODES, appError, type AppError, type ErrorCode } from '@/types/errors';
import { fail, ok, type Result } from '@/types/result';

const isErrorCode = (value: unknown): value is ErrorCode =>
  typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);

/** Noms des Edge Functions (Technical Blueprint V1.3 §13). */
export const EDGE_FUNCTIONS = {
  onboardingCompleteProfile: 'onboarding-complete-profile',
  profileUploadPhoto: 'profile-upload-photo',
  plansCreate: 'plans-create',
  plansDiscover: 'plans-discover',
  plansUpdateCapacity: 'plans-update-capacity',
  plansUpdateLocationTime: 'plans-update-location-time',
  planCancel: 'plan-cancel',
  participationJoin: 'participation-join',
  participationRespond: 'participation-respond',
  participationLeave: 'participation-leave',
  reportsCreate: 'reports-create',
  blocksCreate: 'blocks-create',
  moderationAction: 'moderation-action',
  accountDelete: 'account-delete',
} as const;

/** Convertit une erreur quelconque en AppError. Les messages techniques ne servent qu'aux logs. */
export async function toAppError(error: unknown): Promise<AppError> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body: unknown = await error.context.json();
      const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
      if (isErrorCode(code)) return appError(code);
    } catch {
      /* corps illisible : erreur générique ci-dessous */
    }
    return appError('unknown', 'edge_function_error');
  }
  if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
    return appError('network', error.message);
  }
  if (typeof error === 'object' && error !== null) {
    const e = error as { code?: unknown; message?: unknown; status?: unknown; name?: unknown };
    const message = typeof e.message === 'string' ? e.message : undefined;
    if (message?.includes('max_active_plans_reached')) return appError('max_active_plans', message);
    if (e.code === '42501') return appError('forbidden', message); // RLS / privilège : barrière serveur
    if (e.code === 'PGRST116') return appError('not_found', message);
    if (e.name === 'AuthRetryableFetchError' || message?.includes('Network request failed')) {
      return appError('network', message);
    }
    if (e.status === 401 || e.status === 403) return appError('unauthorized', message);
    return appError('unknown', message);
  }
  return appError('unknown');
}

/** Résultat d'une opération Supabase `{ data, error }` → `Result<T>`. */
export async function fromSupabase<T>(
  promise: PromiseLike<{ data: T; error: unknown }>,
): Promise<Result<NonNullable<T>>> {
  try {
    const { data, error } = await promise;
    if (error) return fail(await toAppError(error));
    if (data === null || data === undefined) return fail(appError('not_found'));
    return ok(data as NonNullable<T>);
  } catch (e) {
    return fail(await toAppError(e));
  }
}

/** Appelle une Edge Function ; le serveur répond `{ data }` ou `{ error: { code, message } }`. */
export async function invokeFunction<
  TResponse,
  TBody extends Record<string, unknown> = Record<string, unknown>,
>(
  name: (typeof EDGE_FUNCTIONS)[keyof typeof EDGE_FUNCTIONS],
  body?: TBody,
): Promise<Result<TResponse>> {
  try {
    const { data, error } = await supabase.functions.invoke<{ data: TResponse }>(name, {
      body: body ?? {},
    });
    if (error) return fail(await toAppError(error));
    if (!data) return fail(appError('unknown', 'empty_response'));
    return ok(data.data);
  } catch (e) {
    return fail(await toAppError(e));
  }
}
