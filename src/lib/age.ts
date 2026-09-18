/** Majorité : 18 ans révolus (Blueprint produit §6.4 point 3). Contrainte doublée en base (`chk_users_majeure`). */
export const MIN_AGE = 18;

/**
 * Âge en années révolues à la date `now`, depuis une date ISO `YYYY-MM-DD`.
 * Comparaison sur (année, mois, jour) — sans fuseau horaire, cas limite : anniversaire le jour même = déjà `n` ans.
 * Retourne `null` si la date est absente ou invalide.
 */
export function computeAge(
  dateNaissance: string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!dateNaissance) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateNaissance);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  let age = now.getFullYear() - year;
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export const isAdult = (
  dateNaissance: string | null | undefined,
  now: Date = new Date(),
): boolean => {
  const age = computeAge(dateNaissance, now);
  return age !== null && age >= MIN_AGE;
};
