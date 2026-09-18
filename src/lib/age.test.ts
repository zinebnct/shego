import { computeAge, isAdult, MIN_AGE } from './age';

describe('computeAge', () => {
  const now = new Date(2026, 8, 18); // 18 septembre 2026

  it("compte l'anniversaire du jour même comme déjà passé", () => {
    expect(computeAge('2008-09-18', now)).toBe(18);
  });

  it("n'atteint pas l'âge la veille de l'anniversaire", () => {
    expect(computeAge('2008-09-19', now)).toBe(17);
  });

  it("gère le mois d'anniversaire déjà écoulé et à venir", () => {
    expect(computeAge('2000-01-31', now)).toBe(26);
    expect(computeAge('2000-12-01', now)).toBe(25);
  });

  it('gère le 29 février', () => {
    expect(computeAge('2000-02-29', new Date(2026, 1, 28))).toBe(25);
    expect(computeAge('2000-02-29', new Date(2026, 2, 1))).toBe(26);
  });

  it('retourne null pour une date absente, invalide ou future', () => {
    expect(computeAge(null, now)).toBeNull();
    expect(computeAge('n/a', now)).toBeNull();
    expect(computeAge('2000-13-01', now)).toBeNull();
    expect(computeAge('2030-01-01', now)).toBeNull();
  });
});

describe('isAdult', () => {
  const now = new Date(2026, 8, 18);
  it(`exige ${MIN_AGE} ans révolus`, () => {
    expect(isAdult('2008-09-18', now)).toBe(true);
    expect(isAdult('2008-09-19', now)).toBe(false);
    expect(isAdult(null, now)).toBe(false);
  });
});
