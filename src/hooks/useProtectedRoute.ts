import { useEffect } from 'react';
import { useRootNavigationState, useRouter, useSegments, type Href } from 'expo-router';
import { isAccessBlocked } from '@/lib/account-status';
import { getNextOnboardingRoute } from '@/lib/onboarding';
import { useSessionStore } from '@/stores/session.store';

/** Écrans d'entrée de l'onboarding (avant toute saisie) : une session existante les traverse directement. */
const ENTRY_SCREENS = ['welcome', 'welcome-confiance', 'auth'];

/**
 * Route guard racine (Blueprint §3). Décisions, dans l'ordre :
 *   1. pas de session Apple/Google              → onboarding (Welcome) ;
 *   2. compte `suspended` / `banned`            → écran dédié « compte restreint » (hors Home/Create/Chat) ;
 *   3. session + arrivée sur un écran d'entrée  → reprise à la dernière étape validée côté serveur, sinon Home.
 * La condition d'accès Create / Join / Chat n'est PAS gérée ici : elle passe par `useAccountReady` /
 * `useAccountGate` (feuilles « ce qui manque » et `under_review`), la liste des plans restant consultable.
 */
export function useProtectedRoute(enabled: boolean): void {
  const router = useRouter();
  const segments = useSegments() as string[];
  const navigationReady = Boolean(useRootNavigationState()?.key);
  const session = useSessionStore((s) => s.session);
  const profile = useSessionStore((s) => s.profile);
  const profileLoading = useSessionStore((s) => s.profileLoading);

  const [group, screen] = segments;

  useEffect(() => {
    if (!enabled || !navigationReady) return;
    const inOnboarding = group === '(onboarding)';
    const inRestricted = group === 'account-restricted';

    if (!session) {
      if (!inOnboarding) router.replace('/(onboarding)/welcome' as Href);
      return;
    }
    if (!profile) return; // profil en cours de chargement : on ne redirige pas à l'aveugle
    if (profileLoading && !inOnboarding) return;

    if (isAccessBlocked(profile.account_status)) {
      if (!inRestricted) router.replace('/account-restricted' as Href);
      return;
    }
    if (inRestricted) {
      router.replace('/' as Href);
      return;
    }

    const atEntry =
      segments.length === 0 ||
      (inOnboarding && screen !== undefined && ENTRY_SCREENS.includes(screen));
    if (atEntry) router.replace((getNextOnboardingRoute(profile) ?? '/(tabs)/home') as Href);
  }, [
    enabled,
    navigationReady,
    session,
    profile,
    profileLoading,
    group,
    screen,
    segments.length,
    router,
  ]);
}
