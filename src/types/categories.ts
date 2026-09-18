/**
 * Les 12 catégories d'activité — liste fermée (Blueprint produit §24, LOCKED).
 * Stockées en base par clé ; libellés résolus côté client via i18n (`categories.<clé>`).
 * Défaut de mode de participation par catégorie : Blueprint produit §3.2 — reflété dans app_config
 * (`category_default_modes`, paramétrable serveur) ; cette constante est le REPLI hors-ligne.
 */
export const CATEGORY_KEYS = [
  'cafe',
  'brunch',
  'shopping',
  'cinema',
  'sport',
  'balade',
  'plage',
  'concert',
  'creatif',
  'voyage',
  'soiree',
  'autre',
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type ParticipationMode = 'auto' | 'request';

/** Règle générale : lieu public + durée courte + horaire de journée → auto ; sinon → request ; doute → request. */
export const DEFAULT_PARTICIPATION_MODE: Record<CategoryKey, ParticipationMode> = {
  cafe: 'auto',
  brunch: 'auto',
  shopping: 'auto',
  cinema: 'auto',
  sport: 'auto',
  balade: 'request',
  plage: 'request',
  concert: 'auto',
  creatif: 'auto',
  voyage: 'request',
  soiree: 'request',
  autre: 'request',
};

export const isCategoryKey = (value: string): value is CategoryKey =>
  (CATEGORY_KEYS as readonly string[]).includes(value);

/** Capacité d'un plan : bornes strictes 2-20, défaut 4, aucune valeur « illimité » (Create Plan §7). */
export const PLAN_CAPACITY = { min: 2, max: 20, default: 4 } as const;
/** Limite anti-spam : plans actifs simultanés par créatrice (Blueprint produit §10.3). */
export const MAX_ACTIVE_PLANS = 3;
