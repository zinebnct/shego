/**
 * Signalements — Technical Blueprint V1.3 §21 : reportEntity.
 * Motifs en liste fermée. Le signalement porte sur un COMPORTEMENT ou une incohérence observable, jamais sur une
 * affirmation de genre (Safety Layer §6). Le seuil de passage en `under_review` est appliqué par trigger serveur.
 */
import type { ReportMotif, ReportTargetType } from '@/types/domain';
import type { Result } from '@/types/result';
import { EDGE_FUNCTIONS, invokeFunction } from './_internal';

export const REPORT_COMMENT_MAX_LENGTH = 500;

export interface ReportInput {
  targetType: ReportTargetType;
  targetId: string;
  motif: ReportMotif;
  commentaire?: string;
}

export function reportEntity(input: ReportInput): Promise<Result<{ id: string }>> {
  return invokeFunction(EDGE_FUNCTIONS.reportsCreate, {
    target_type: input.targetType,
    target_id: input.targetId,
    motif: input.motif,
    commentaire: input.commentaire?.slice(0, REPORT_COMMENT_MAX_LENGTH) ?? null,
  });
}
