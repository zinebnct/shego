import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSessionStore } from '@/stores/session.store';

/**
 * À monter UNE fois (root layout) : lit la session persistée, écoute l'auth, et recharge le profil au retour au
 * premier plan pour propager un éventuel changement de `account_status` (modération).
 */
export function useAuthBootstrap(): boolean {
  const initialized = useSessionStore((s) => s.initialized);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void useSessionStore
      .getState()
      .initialize()
      .then((stop) => {
        if (cancelled) stop();
        else unsubscribe = stop;
      });

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void useSessionStore.getState().refreshProfile();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
      sub.remove();
    };
  }, []);

  return initialized;
}
