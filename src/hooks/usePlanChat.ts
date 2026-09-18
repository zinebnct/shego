import { useCallback, useEffect, useState } from 'react';
import { getMessages, sendMessage, subscribeToPlanChat } from '@/services/chat.service';
import { useSessionStore } from '@/stores/session.store';
import type { ChatMessage } from '@/types/domain';
import type { AppError } from '@/types/errors';

/** Message local en cours d'envoi ou en échec (envoi optimiste — Plan Group Chat §7, Blueprint §14). */
export interface ChatItem extends ChatMessage {
  localStatus?: 'sending' | 'failed';
}

const sortByDate = (items: ChatItem[]) =>
  [...items].sort((a, b) => a.created_at.localeCompare(b.created_at));

/**
 * Chat d'un plan : historique + un canal Realtime par plan + envoi optimiste.
 * `enabled` doit valoir `false` pour un compte non `active` (under_review ⇒ aucun Chat) : la RLS refuse de toute façon
 * lecture et écriture, ce garde-fou évite seulement des appels inutiles.
 */
export function usePlanChat(planId: string, enabled: boolean) {
  const profileId = useSessionStore((s) => s.profile?.id ?? null);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [loadedPlanId, setLoadedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    void getMessages(planId).then((result) => {
      if (!active) return;
      if (result.error) setError(result.error);
      else setMessages((current) => mergeMessages(result.data, current));
      setLoadedPlanId(planId);
    });

    const unsubscribe = subscribeToPlanChat(planId, {
      onMessage: (message) => active && setMessages((current) => mergeMessages([message], current)),
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [planId, enabled]);

  const send = useCallback(
    async (contenu: string, localId: string = `local-${Date.now()}`) => {
      if (!profileId) return;
      const optimistic: ChatItem = {
        id: localId,
        plan_id: planId,
        sender_id: profileId,
        contenu,
        type: 'user',
        created_at: new Date().toISOString(),
        localStatus: 'sending',
      };
      setMessages((current) =>
        mergeMessages(
          [optimistic],
          current.filter((m) => m.id !== localId),
        ),
      );

      const result = await sendMessage(planId, contenu);
      setMessages((current) => {
        const withoutLocal = current.filter((m) => m.id !== localId);
        if (result.error)
          return sortByDate([...withoutLocal, { ...optimistic, localStatus: 'failed' }]);
        return mergeMessages([result.data], withoutLocal);
      });
    },
    [planId, profileId],
  );

  const retry = useCallback(
    (localId: string) => {
      const failed = messages.find((m) => m.id === localId && m.localStatus === 'failed');
      if (failed) void send(failed.contenu, localId);
    },
    [messages, send],
  );

  const discard = useCallback((localId: string) => {
    setMessages((current) => current.filter((m) => m.id !== localId));
  }, []);

  const loading = enabled && loadedPlanId !== planId;
  return { messages, loading, error, send, retry, discard };
}

/** Fusionne sans doublon (le même message peut arriver par Realtime ET par la réponse de l'insert). */
function mergeMessages(incoming: ChatItem[], current: ChatItem[]): ChatItem[] {
  const byId = new Map<string, ChatItem>();
  for (const m of current) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, { ...byId.get(m.id), ...m });
  return sortByDate([...byId.values()]);
}
