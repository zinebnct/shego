/**
 * Chat de plan — Technical Blueprint V1.3 §14, §21 : subscribeToPlanChat, sendMessage, getMessages.
 *
 * Un canal Realtime PAR PLAN (`plan:{plan_id}`), abonné aux INSERT de `messages` filtrés par plan_id.
 * L'autorisation est portée par la RLS de `messages` : membres du plan (créatrice + acceptées), compte `active`
 * (donc `under_review` ⇒ ni lecture ni écriture), blocages respectés. Texte uniquement en V1 ; pas de DM.
 */
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types/domain';
import { appError } from '@/types/errors';
import { fail, ok, type Result } from '@/types/result';
import { fromSupabase, toAppError } from './_internal';
import { getCurrentUserId } from './auth.service';

export const MESSAGE_MAX_LENGTH = 1000;
const MESSAGE_COLUMNS = 'id, plan_id, sender_id, contenu, type, created_at';
const DEFAULT_PAGE_SIZE = 50;

const isMessageRow = (value: unknown): value is ChatMessage => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.plan_id === 'string' &&
    typeof v.contenu === 'string' &&
    (v.type === 'user' || v.type === 'system') &&
    typeof v.created_at === 'string'
  );
};

/** Historique paginé, du plus ancien au plus récent. `before` : `created_at` du plus ancien message déjà chargé. */
export async function getMessages(
  planId: string,
  options: { before?: string; limit?: number } = {},
): Promise<Result<ChatMessage[]>> {
  let query = supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .eq('plan_id', planId)
    .order('created_at', { ascending: false })
    .limit(options.limit ?? DEFAULT_PAGE_SIZE);
  if (options.before) query = query.lt('created_at', options.before);

  const result = await fromSupabase(query);
  if (result.error) return fail(result.error);
  return ok(result.data.filter(isMessageRow).reverse());
}

/** Envoi (l'envoi optimiste — état `sending` — est purement client : voir `usePlanChat`). */
export async function sendMessage(planId: string, contenu: string): Promise<Result<ChatMessage>> {
  const text = contenu.trim();
  if (text.length === 0 || text.length > MESSAGE_MAX_LENGTH)
    return fail(appError('invalid_request', 'message_length'));

  const senderId = await getCurrentUserId();
  if (!senderId) return fail(appError('unauthorized'));

  const result = await fromSupabase(
    supabase
      .from('messages')
      .insert({ plan_id: planId, sender_id: senderId, contenu: text, type: 'user' })
      .select(MESSAGE_COLUMNS)
      .single(),
  );
  if (result.error) return fail(result.error);
  return isMessageRow(result.data)
    ? ok(result.data)
    : fail(appError('unknown', 'invalid_message_row'));
}

export interface PlanChatHandlers {
  onMessage: (message: ChatMessage) => void;
  onStatus?: (status: 'subscribed' | 'closed' | 'error') => void;
}

/** Abonnement Realtime au chat d'un plan. Retourne la fonction de désabonnement. */
export function subscribeToPlanChat(planId: string, handlers: PlanChatHandlers): () => void {
  const channel = supabase
    .channel(`plan:${planId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `plan_id=eq.${planId}` },
      (payload) => {
        if (isMessageRow(payload.new)) handlers.onMessage(payload.new);
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') handlers.onStatus?.('subscribed');
      else if (status === 'CLOSED') handlers.onStatus?.('closed');
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') handlers.onStatus?.('error');
    });

  return () => {
    void supabase.removeChannel(channel).catch((e: unknown) => toAppError(e));
  };
}
