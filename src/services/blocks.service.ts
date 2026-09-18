/**
 * Blocages — Technical Blueprint V1.3 §21 : blockUser, unblockUser, listBlocked.
 * Blocage bilatéral et total, effectif immédiatement, sans notification à la personne bloquée.
 * Si la personne bloquée est la créatrice d'un plan rejoint (ou l'inverse), le trigger serveur retire la participation.
 */
import { supabase } from '@/lib/supabase';
import type { BlockedUser } from '@/types/domain';
import { appError } from '@/types/errors';
import { fail, ok, type Result } from '@/types/result';
import { EDGE_FUNCTIONS, fromSupabase, invokeFunction, toAppError } from './_internal';
import { getCurrentUserId } from './auth.service';

export function blockUser(blockedId: string): Promise<Result<{ ok: true }>> {
  return invokeFunction(EDGE_FUNCTIONS.blocksCreate, { blocked_id: blockedId });
}

/** Déblocage en un tap (avec confirmation côté UI). La RLS n'autorise que la suppression de SES blocages. */
export async function unblockUser(blockedId: string): Promise<Result<true>> {
  const userId = await getCurrentUserId();
  if (!userId) return fail(appError('unauthorized'));
  try {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_id', blockedId);
    if (error) return fail(await toAppError(error));
    return ok(true);
  } catch (e) {
    return fail(await toAppError(e));
  }
}

/** Liste des comptes bloqués (Paramètres) — via RPC : `public_profiles` masque volontairement les comptes bloqués. */
export async function listBlocked(): Promise<Result<BlockedUser[]>> {
  return fromSupabase(supabase.rpc('fn_list_blocked'));
}
