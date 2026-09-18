import type { Profile } from '@/types/domain';
import { evaluateAccountReadiness } from './account-readiness';

const now = new Date(2026, 8, 18);

const completeProfile: Profile = {
  id: 'u1',
  auth_provider: 'apple',
  prenom: 'Salma',
  date_naissance: '1995-06-15',
  ville_id: 'city-1',
  bio: null,
  photo_url: 'u1/profile.jpg',
  locale: 'fr',
  account_status: 'active',
  notifications_opt_in: false,
  location_opt_in: false,
  device_id: null,
  push_token: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const evaluate = (profile: Partial<Profile> | null, hasSession = true) =>
  evaluateAccountReadiness({
    hasSession,
    profile: profile ? { ...completeProfile, ...profile } : null,
    now,
  });

describe('condition d’accès « compte prêt » (Blueprint produit §6.4)', () => {
  it('est prête avec session, prénom, date 18+, ville, photo et compte active', () => {
    expect(evaluate({})).toEqual({ ready: true, gate: 'none', missing: [] });
  });

  it('exige une session Apple/Google valide', () => {
    expect(evaluate({}, false)).toMatchObject({
      ready: false,
      gate: 'no_session',
      missing: ['session'],
    });
  });

  it.each([
    ['prénom', { prenom: null }, 'profile', 'prenom'],
    ['date de naissance', { date_naissance: null }, 'profile', 'date_naissance'],
    ['ville', { ville_id: null }, 'profile', 'ville'],
  ] as const)(
    'profil incomplet (%s manquant) → feuille « Termine ton profil »',
    (_label, patch, gate, missing) => {
      const result = evaluate(patch);
      expect(result.ready).toBe(false);
      expect(result.gate).toBe(gate);
      expect(result.missing).toEqual([missing]);
    },
  );

  it('photo absente → feuille « Ajoute une photo »', () => {
    expect(evaluate({ photo_url: null })).toMatchObject({
      ready: false,
      gate: 'photo',
      missing: ['photo'],
    });
  });

  it('profil incomplet ET photo absente → feuille combinée', () => {
    const result = evaluate({ prenom: null, photo_url: null });
    expect(result.gate).toBe('profile_and_photo');
  });

  it('refuse une personne mineure (18+ confirmé par le calcul)', () => {
    expect(evaluate({ date_naissance: '2010-01-01' }).ready).toBe(false);
    expect(evaluate({ date_naissance: '2008-09-19' }).missing).toContain('date_naissance');
    expect(evaluate({ date_naissance: '2008-09-18' }).ready).toBe(true);
  });

  it('under_review bloque Create / Join / Chat même avec un profil complet', () => {
    expect(evaluate({ account_status: 'under_review' })).toMatchObject({
      ready: false,
      gate: 'under_review',
      missing: ['account_status'],
    });
  });

  it('under_review prime sur « ce qui manque » (une seule feuille)', () => {
    expect(evaluate({ account_status: 'under_review', photo_url: null }).gate).toBe('under_review');
  });

  it.each(['suspended', 'banned'] as const)('%s → écran dédié « compte restreint »', (status) => {
    expect(evaluate({ account_status: status })).toMatchObject({
      ready: false,
      gate: 'restricted',
    });
  });

  it('un profil pas encore chargé n’ouvre jamais l’accès', () => {
    expect(evaluate(null).ready).toBe(false);
  });
});
