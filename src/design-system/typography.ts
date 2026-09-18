/**
 * Typographie SHEGO V1.3 (DS §4).
 * Display / marque : Fraunces (logotype, titres d'accueil, états vides — jamais l'UI courante, jamais < 20 px).
 * UI / body : Plus Jakarta Sans. Chiffres : variante tabulaire. Arabe : IBM Plex Sans Arabic (LATER, non chargé).
 */
import type { TextStyle } from 'react-native';

export const fontFamilies = {
  displaySemiBold: 'Fraunces_600SemiBold',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export type TextVariant =
  | 'displayLg'
  | 'displaySm'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'sub'
  | 'caption'
  | 'label'
  | 'button'
  | 'tab'
  | 'numeric';

type Style = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontVariant'
>;

/** Échelle typographique (taille / interligne / letter-spacing) — DS §4. */
export const typography: Record<TextVariant, Style> = {
  displayLg: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  displaySm: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h1: { fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  h2: { fontFamily: fontFamilies.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  h3: { fontFamily: fontFamilies.semiBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 23, letterSpacing: 0 },
  bodyStrong: { fontFamily: fontFamilies.semiBold, fontSize: 16, lineHeight: 23, letterSpacing: 0 },
  sub: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 19, letterSpacing: 0 },
  caption: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  label: { fontFamily: fontFamilies.semiBold, fontSize: 13, lineHeight: 16, letterSpacing: 0.2 },
  button: { fontFamily: fontFamilies.semiBold, fontSize: 16, lineHeight: 20, letterSpacing: 0 },
  tab: { fontFamily: fontFamilies.semiBold, fontSize: 11, lineHeight: 13, letterSpacing: 0.2 },
  numeric: { fontFamily: fontFamilies.medium, fontVariant: ['tabular-nums'] },
};

/** Dynamic Type jusqu'à 120 % sans rupture (DS §4). */
export const MAX_FONT_SIZE_MULTIPLIER = 1.2;
