/**
 * Participation — Technical Blueprint V1.3 §21 : joinPlan, respondToRequest, leavePlan.
 * Toutes les mutations passent par Edge Functions (condition d'accès, blocage, places : revérifiés côté serveur).
 * `under_review` : refusé côté serveur (`under_review`) — l'UI ouvre AccountGateSheet AVANT l'appel via useAccountGate.
 */
import { EDGE_FUNCTIONS, invokeFunction } from './_internal';
import type { Result } from '@/types/result';

/** `accepted` (mode Direct, place prise) ou `pending` (mode Sur demande, en attente de la créatrice). */
export type JoinStatus = 'accepted' | 'pending';

export function joinPlan(planId: string): Promise<Result<{ status: JoinStatus }>> {
  return invokeFunction(EDGE_FUNCTIONS.participationJoin, { plan_id: planId });
}

export type RequestDecision = 'accept' | 'decline';

/** Créatrice uniquement ; contrôle le nombre de places restantes. Refus toujours silencieux sur le motif. */
export function respondToRequest(
  planParticipantId: string,
  decision: RequestDecision,
): Promise<Result<{ status: 'accepted' | 'declined' }>> {
  return invokeFunction(EDGE_FUNCTIONS.participationRespond, {
    plan_participant_id: planParticipantId,
    decision,
  });
}

/** Libère la place et retire immédiatement l'accès au chat. */
export function leavePlan(planParticipantId: string): Promise<Result<{ ok: true }>> {
  return invokeFunction(EDGE_FUNCTIONS.participationLeave, {
    plan_participant_id: planParticipantId,
  });
}
