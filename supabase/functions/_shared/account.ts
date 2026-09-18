// Condition d'accès « compte prêt » — la vérité est en SQL (`fn_is_account_ready`, migration 3).
// Cette fonction ne la recopie pas : elle l'appelle, puis n'affine que le CODE D'ERREUR pour l'UI (Blueprint §12).
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from './errors.ts';

export async function assertAccountReady(service: SupabaseClient, userId: string): Promise<void> {
  const { data: ready, error } = await service.rpc('fn_is_account_ready', { p_user_id: userId });
  if (error) throw new AppError('internal');
  if (ready === true) return;

  const { data: user } = await service
    .from('users')
    .select('account_status')
    .eq('id', userId)
    .maybeSingle();
  switch (user?.account_status) {
    case 'under_review':
      throw new AppError('under_review');
    case 'suspended':
    case 'banned':
      throw new AppError('account_restricted');
    default:
      throw new AppError('account_not_ready');
  }
}
