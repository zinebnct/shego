import type { Profile } from '@/types/domain';
import { getNextOnboardingRoute, ONBOARDING_ROUTES } from './onboarding';

const base = {
  id: 'u1',
  auth_provider: 'google',
  prenom: null,
  date_naissance: null,
  ville_id: null,
  bio: null,
  photo_url: null,
  locale: 'fr',
  account_status: 'active',
  notifications_opt_in: false,
  location_opt_in: false,
  device_id: null,
  push_token: null,
  created_at: '',
  updated_at: '',
} as Profile;
const now = new Date(2026, 8, 18);

describe('reprise de l’onboarding (dernière étape validée côté serveur)', () => {
  it('compte 11 écrans dans l’ordre du Blueprint', () => {
    expect(ONBOARDING_ROUTES).toHaveLength(11);
    expect(ONBOARDING_ROUTES[2]).toBe('/(onboarding)/auth');
  });

  it('reprend au premier champ obligatoire manquant', () => {
    expect(getNextOnboardingRoute(null, now)).toBe('/(onboarding)/prenom');
    expect(getNextOnboardingRoute({ ...base }, now)).toBe('/(onboarding)/prenom');
    expect(getNextOnboardingRoute({ ...base, prenom: 'Salma' }, now)).toBe(
      '/(onboarding)/date-naissance',
    );
    expect(
      getNextOnboardingRoute({ ...base, prenom: 'Salma', date_naissance: '1995-06-15' }, now),
    ).toBe('/(onboarding)/ville');
    expect(
      getNextOnboardingRoute(
        { ...base, prenom: 'Salma', date_naissance: '1995-06-15', ville_id: 'c' },
        now,
      ),
    ).toBe('/(onboarding)/photo');
  });

  it('renvoie null (→ Home) quand le profil de base est complet', () => {
    const complete = {
      ...base,
      prenom: 'Salma',
      date_naissance: '1995-06-15',
      ville_id: 'c',
      photo_url: 'u1/profile.jpg',
    };
    expect(getNextOnboardingRoute(complete, now)).toBeNull();
  });
});
