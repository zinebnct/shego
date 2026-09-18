import {
  CATEGORY_KEYS,
  DEFAULT_PARTICIPATION_MODE,
  MAX_ACTIVE_PLANS,
  PLAN_CAPACITY,
  isCategoryKey,
} from './categories';
import { categoryTints } from '@/design-system';

describe('catégories (liste fermée de 12)', () => {
  it('a 12 catégories, chacune avec une teinte de tuile et un mode par défaut', () => {
    expect(CATEGORY_KEYS).toHaveLength(12);
    for (const key of CATEGORY_KEYS) {
      expect(categoryTints[key]).toMatch(/^#[0-9A-F]{6}$/);
      expect(['auto', 'request']).toContain(DEFAULT_PARTICIPATION_MODE[key]);
    }
  });

  it('applique le défaut contextuel du Blueprint produit §3.2', () => {
    const auto = ['cafe', 'brunch', 'shopping', 'cinema', 'sport', 'concert', 'creatif'];
    const request = ['balade', 'plage', 'soiree', 'voyage', 'autre'];
    for (const key of auto)
      expect(DEFAULT_PARTICIPATION_MODE[key as keyof typeof DEFAULT_PARTICIPATION_MODE]).toBe(
        'auto',
      );
    for (const key of request)
      expect(DEFAULT_PARTICIPATION_MODE[key as keyof typeof DEFAULT_PARTICIPATION_MODE]).toBe(
        'request',
      );
  });

  it('borne la capacité à 2-20 (défaut 4) et les plans actifs à 3', () => {
    expect(PLAN_CAPACITY).toEqual({ min: 2, max: 20, default: 4 });
    expect(MAX_ACTIVE_PLANS).toBe(3);
  });

  it('rejette une clé inconnue', () => {
    expect(isCategoryKey('cafe')).toBe(true);
    expect(isCategoryKey('dating')).toBe(false);
  });
});
