/**
 * SHEGO Design System V1.3 — tokens (source : docs/02_DESIGN_SYSTEM_V1.3.md §3-§6, §17, §20).
 * Territoire « Modern Medina ». Aucune valeur inventée hors mention explicite « défaut technique ».
 * Règles : pas de dégradé, pas de rose comme signature, mode sombre = LATER.
 */

// --- §3 Couleurs ---------------------------------------------------------------------------------
export const colors = {
  brand: {
    grenat: '#6B2A4F', // primaire — CTA principal, sélection, liens. Un seul bouton plein par écran.
    grenat700: '#54203E', // pressed du primaire uniquement
    grenat100: '#F2E6EC', // tint : fond de chip sélectionnée (jamais du texte)
    terracotta: '#D0583C', // décoratif/catégoriel — INTERDIT pour tout statut ou erreur
    terracotta100: '#FAE7E1',
    safran: '#F2A50C', // imminence (texte Encre dessus, jamais blanc)
    safran100: '#FDF0D6',
    /** `brand.trust` (Atlas) : mode Direct / success UNIQUEMENT — jamais une confiance d'identité (DS §3, §20). */
    trust: '#12775E',
    trustTint: '#E0F0EB',
  },
  surface: {
    sable: '#FBF7F2', // background principal de l'app
    argile: '#F3EBE2', // sections, champs au repos
    surface: '#FFFFFF', // cartes, feuilles, barres
    surfacePressed: '#F7F1EA',
    overlay: 'rgba(27, 22, 19, 0.48)', // #1B1613 à 48 %
  },
  text: {
    encre: '#1B1613', // jamais du noir pur
    encre70: '#5C524C', // ≥ 4.5:1 sur Sable et Surface
    encre45: '#8C817A', // placeholders/désactivé — jamais une info nécessaire à la décision
    surGrenat: '#FFFFFF',
  },
  border: {
    default: '#E8DED3',
    strong: '#CFC2B4',
  },
  status: {
    success: '#12775E',
    successTint: '#E0F0EB',
    warning: '#9A6412', // texte sur safran100 ; jamais de warning pleine surface
    error: '#A8201A',
    errorTint: '#FBE9E7',
    info: '#2C5A8C', // notices de sécurité, messages système, bannière under_review
    infoTint: '#E7EEF6',
  },
} as const;

/** Teintes de tuile de catégorie (DS §6 — source unique ; remplace la palette de Home V1.2). */
export const categoryTints = {
  cafe: '#F2E4D8',
  brunch: '#FAE7E1',
  shopping: '#F1E6EF',
  cinema: '#E7E7F2',
  sport: '#E0F0EB',
  balade: '#E4EFE0',
  plage: '#DDEDF2',
  concert: '#EFE3F2',
  creatif: '#FDF0D6',
  voyage: '#E7EEF6',
  soiree: '#E9E5F5',
  autre: '#F3EBE2',
} as const;

// --- §5 Espacement, rayons, hauteurs -------------------------------------------------------------
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20, // marge latérale d'écran
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
} as const;

/** Rien n'est en pilule sauf ce qui est rond par nature : les boutons sont à 16. */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 999,
} as const;

export const sizes = {
  button: 52,
  buttonCompact: 40,
  input: 52,
  chip: 36,
  categoryTile: 44,
  planCardMin: 124,
  tabBar: 64,
  createButton: 56,
  createButtonLift: 12,
  header: 56,
  listRow: 64,
  touchTarget: 44,
} as const;

export const layout = {
  screenMargin: 20,
  screenMarginCompact: 16, // écrans ≤ 360 pt de large
  compactWidth: 360,
  cardGap: 10,
} as const;

// --- §6 Icônes / §8 Avatars ----------------------------------------------------------------------
export const iconSizes = { sm: 16, md: 20, base: 24, lg: 28, xl: 40 } as const;
export const iconStroke = 1.75;

export const avatarSizes = { xs: 20, sm: 32, md: 44, lg: 72, xl: 104 } as const;
/** Méta-barre de Plan Card : valeur propre à ce composant (Home V1.2, DS §7). */
export const planCardAvatarSize = 24;

// --- Ombres — DS : « aucune ombre portée sauf éléments réellement flottants » ---------------------
// Valeurs = DÉFAUTS TECHNIQUES (le DS ne les chiffre pas) ; `elevation2` sert au bouton central Créer (Home §5).
export const shadows = {
  none: {},
  elevation1: {
    shadowColor: colors.text.encre,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  elevation2: {
    shadowColor: colors.text.encre,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
} as const;

// --- §17 Motion : durées 100-300 ms, easing.standard par défaut, prefers-reduced-motion respecté ----
export const motion = {
  duration: { instant: 100, press: 120, base: 200, slide: 240, slow: 300 },
  /** `easing.standard` : défaut technique (cubic-bezier 0.2, 0, 0, 1). */
  easing: { standard: [0.2, 0, 0, 1] as const },
  pressScale: 0.98, // Primary pressed : 120 ms, scale 0,98 (DS §9)
} as const;

export type CategoryKey = keyof typeof categoryTints;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
