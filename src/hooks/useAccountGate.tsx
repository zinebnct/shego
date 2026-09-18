import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter, type Href } from 'expo-router';
import { AccountGateSheet } from '@/components/feedback/AccountGateSheet';
import { getNextOnboardingRoute } from '@/lib/onboarding';
import { useSessionStore } from '@/stores/session.store';
import { useAccountReady } from './useAccountReady';

interface AccountGateContextValue {
  /**
   * Exécute `action` si le compte est prêt ; sinon ouvre l'UNIQUE AccountGateSheet (message précis) et retourne `false`.
   * Point d'entrée commun de Create (bouton « + Créer »), Join (Rejoindre / Demander à rejoindre) et Chat.
   */
  requireReady: (action?: () => void) => boolean;
  openGate: () => void;
  /** Exécute l'action de la feuille courante (`Ajouter` / `Continuer`) : réutilisée par les bannières de la Home. */
  runGateAction: () => void;
}

const AccountGateContext = createContext<AccountGateContextValue | null>(null);

/**
 * Monte l'unique instance d'AccountGateSheet (Blueprint §4 : « un seul composant, invoqué depuis plusieurs points
 * d'entrée — ne jamais dupliquer cette logique par écran »).
 */
export function AccountGateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const readiness = useAccountReady();
  const profile = useSessionStore((s) => s.profile);
  const [visible, setVisible] = useState(false);

  const openGate = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const requireReady = useCallback(
    (action?: () => void) => {
      if (readiness.ready) {
        action?.();
        return true;
      }
      setVisible(true);
      return false;
    },
    [readiness.ready],
  );

  const runGateAction = useCallback(() => {
    switch (readiness.gate) {
      case 'photo':
        router.push('/(onboarding)/photo' as Href);
        break;
      case 'profile':
      case 'profile_and_photo':
        router.push((getNextOnboardingRoute(profile) ?? '/(onboarding)/prenom') as Href);
        break;
      case 'no_session':
        router.push('/(onboarding)/auth' as Href);
        break;
      case 'restricted':
        router.replace('/account-restricted' as Href);
        break;
      default:
        break; // under_review : feuille d'information non actionnable
    }
  }, [readiness.gate, profile, router]);

  const onAction = useCallback(() => {
    setVisible(false);
    runGateAction();
  }, [runGateAction]);

  const value = useMemo(
    () => ({ requireReady, openGate, runGateAction }),
    [requireReady, openGate, runGateAction],
  );

  return (
    <AccountGateContext.Provider value={value}>
      {children}
      <AccountGateSheet
        visible={visible && !readiness.ready}
        gate={readiness.gate}
        onClose={close}
        onAction={onAction}
      />
    </AccountGateContext.Provider>
  );
}

export function useAccountGate(): AccountGateContextValue {
  const context = useContext(AccountGateContext);
  if (!context) throw new Error('useAccountGate doit être utilisé sous <AccountGateProvider>.');
  return context;
}
