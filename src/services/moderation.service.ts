/**
 * Modération — BACKOFFICE UNIQUEMENT (Technical Blueprint V1.3 §21 : « backoffice uniquement »).
 * Ce module n'est JAMAIS importé par l'app mobile (règle ESLint `no-restricted-imports`). Il vit ici pour partager
 * le client typé avec le backoffice web (dossier `backoffice/`). Les droits sont portés par le serveur : rôle admin
 * (claim `app_metadata.role`) dans la RLS de `reports` / `moderation_actions` et dans l'Edge Function `moderation-action`.
 *
 * Actions autorisées (Safety Layer §12) : avertir, passer en under_review, réactiver, suspendre, bannir —
 * chacune journalisée dans `moderation_actions`. Aucun autre état de confiance n'existe.
 */
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import type { Result } from '@/types/result';
import { EDGE_FUNCTIONS, fromSupabase, invokeFunction } from './_internal';

export type ModerationActionType =
  'avertir' | 'passer_under_review' | 'reactiver' | 'suspendre' | 'bannir';
export type ReportStatus = 'ouvert' | 'traite' | 'rejete';

export function listReports(
  options: { status?: ReportStatus; limit?: number } = {},
): Promise<Result<Tables<'reports'>[]>> {
  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 50);
  if (options.status) query = query.eq('status', options.status);
  return fromSupabase(query);
}

export function applyAction(input: {
  targetUserId: string;
  action: ModerationActionType;
  raison?: string;
}): Promise<Result<{ ok: true }>> {
  return invokeFunction(EDGE_FUNCTIONS.moderationAction, {
    target_user_id: input.targetUserId,
    action: input.action,
    raison: input.raison ?? null,
  });
}
