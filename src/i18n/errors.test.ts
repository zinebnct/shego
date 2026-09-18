import fr from './fr.json';
import { ERROR_MESSAGE_KEYS, errorMessage } from './errors';
import { ERROR_CODES } from '@/types/errors';

const allStrings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Object.values(value as Record<string, unknown>).flatMap(allStrings);

describe('erreurs et textes LOCKED', () => {
  it('mappe chaque code d’erreur vers un texte français existant', () => {
    for (const code of ERROR_CODES) {
      expect(ERROR_MESSAGE_KEYS[code]).toBe(`errors.${code}`);
      expect(errorMessage(code).length).toBeGreaterThan(0);
      expect(errorMessage(code)).not.toMatch(/^errors\./);
    }
  });

  it('reprend mot pour mot les formulations « ce qui manque » et under_review', () => {
    expect(fr.account.gate.photo).toBe('Ajoute une photo pour pouvoir créer ou rejoindre un plan.');
    expect(fr.account.gate.profile).toBe(
      'Termine ton profil pour pouvoir créer ou rejoindre un plan.',
    );
    expect(fr.account.gate.profileAndPhoto).toBe(
      'Termine ton profil et ajoute une photo pour créer ou rejoindre un plan.',
    );
    expect(fr.account.underReview).toBe(
      "Ton compte est en cours d'examen suite à un signalement. Certaines actions sont limitées pendant ce temps.",
    );
    expect(errorMessage('under_review')).toBe(fr.account.underReview);
  });

  it('utilise la justification canonique de la photo de profil', () => {
    expect(fr.onboarding.photo.subtitle).toBe(
      "Une photo claire aide les participantes à se reconnaître lorsqu'elles se retrouvent.",
    );
  });

  it('ne contient AUCUNE formulation de vérification d’identité ou de genre (Blueprint produit §6.5)', () => {
    const forbidden = [
      /communauté vérifiée/i,
      /profil vérifié/i,
      /compte vérifié/i,
      /identité vérifiée/i,
      /tu es vérifiée/i,
      /chaque personne est vérifiée/i,
      /badge/i,
      /vérification de genre/i,
      /confirmé par téléphone/i,
    ];
    for (const text of allStrings(fr)) {
      for (const pattern of forbidden) expect(text).not.toMatch(pattern);
    }
  });

  it('présente l’authentification comme un accès au compte, pas comme une preuve', () => {
    expect(fr.onboarding.welcomeTrust.authenticated).toBe(
      'Chaque compte est authentifié via Apple ou Google.',
    );
    expect(fr.onboarding.welcomeTrust.headline).toBe(
      'Une communauté entre femmes, modérée et protégée',
    );
  });
});
