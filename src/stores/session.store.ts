/**
 * État client léger de la session et du profil (Zustand — Blueprint §2). Aucun appel Supabase direct :
 * tout passe par `src/services`. Le profil (dont `account_status`) est rechargé à chaque changement de session
 * et au retour au premier plan, car la modération peut le modifier à tout moment (under_review, suspended…).
 */
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, signOut as signOutService } from '@/services/auth.service';
import { getMe } from '@/services/profile.service';
import type { Profile } from '@/types/domain';

interface SessionState {
  /** Faux tant que la session persistée n'a pas été lue (évite un flash vers l'onboarding). */
  initialized: boolean;
  session: Session | null;
  profile: Profile | null;
  profileLoading: boolean;
  /** Démarre l'écoute de l'auth. Retourne la fonction de désabonnement. */
  initialize: () => Promise<() => void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  initialized: false,
  session: null,
  profile: null,
  profileLoading: false,

  initialize: async () => {
    const initial = await getSession();
    set({ session: initial.data ?? null });
    if (initial.data) await get().refreshProfile();
    set({ initialized: true });

    return onAuthStateChange((event, session) => {
      const previousUserId = get().session?.user.id;
      set({ session });
      if (!session) {
        set({ profile: null });
      } else if (event === 'SIGNED_IN' || session.user.id !== previousUserId) {
        // Ne pas appeler Supabase de façon synchrone dans le callback d'auth (risque de blocage) : on diffère.
        setTimeout(() => void get().refreshProfile(), 0);
      }
    });
  },

  refreshProfile: async () => {
    if (!get().session) return;
    set({ profileLoading: true });
    const result = await getMe();
    // En cas d'erreur réseau on conserve le dernier profil connu plutôt que de bloquer l'accès.
    set({ profile: result.error ? get().profile : result.data, profileLoading: false });
  },

  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await signOutService();
    set({ session: null, profile: null });
  },
}));
