import { useSessionStore } from '@/stores/session.store';

/** Session Apple/Google + profil courant. Authentifie l'ACCÈS au compte — jamais une preuve d'identité ou de genre. */
export function useAuth() {
  const initialized = useSessionStore((s) => s.initialized);
  const session = useSessionStore((s) => s.session);
  const profile = useSessionStore((s) => s.profile);
  const profileLoading = useSessionStore((s) => s.profileLoading);
  const refreshProfile = useSessionStore((s) => s.refreshProfile);
  const setProfile = useSessionStore((s) => s.setProfile);
  const signOut = useSessionStore((s) => s.signOut);

  return {
    initialized,
    session,
    profile,
    profileLoading,
    isSignedIn: session !== null,
    refreshProfile,
    setProfile,
    signOut,
  };
}
