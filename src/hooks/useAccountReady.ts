import { useMemo } from 'react';
import { evaluateAccountReadiness, type AccountReadiness } from '@/lib/account-readiness';
import { useSessionStore } from '@/stores/session.store';

export interface UseAccountReady extends AccountReadiness {
  /** Profil en cours de chargement : ne pas afficher de feuille « ce qui manque » tant que c'est vrai. */
  loading: boolean;
}

/**
 * MÉCANISME CENTRALISÉ de la condition d'accès LOCKED (Blueprint produit §6.4) — partagé par les guards de
 * navigation et par les actions Create / Join / Chat (via `useAccountGate`).
 *
 *   session Apple/Google valide + prénom + date de naissance 18+ + ville + photo + account_status = 'active'
 *
 * `under_review` bloque Create, Join ET Chat (règle binaire). La vérité reste côté serveur (RLS + Edge Functions) ;
 * ce hook ne sert qu'à choisir le bon écran / la bonne feuille AVANT l'échec.
 */
export function useAccountReady(): UseAccountReady {
  const session = useSessionStore((s) => s.session);
  const profile = useSessionStore((s) => s.profile);
  const initialized = useSessionStore((s) => s.initialized);
  const profileLoading = useSessionStore((s) => s.profileLoading);

  const readiness = useMemo(
    () => evaluateAccountReadiness({ hasSession: session !== null, profile }),
    [session, profile],
  );

  return {
    ...readiness,
    loading: !initialized || (session !== null && profile === null && profileLoading),
  };
}
