import { I18nManager } from 'react-native';
import type { Locale } from '@/types/domain';

/**
 * Architecture i18n/RTL prête pour fr / ar / en (Blueprint produit §5) — mais SEUL le français est développé en V1.
 * Activer une langue = ajouter son fichier de ressources, l'inscrire dans `resources` (./index.ts) et dans
 * ACTIVE_LOCALES. `users.locale` porte déjà la préférence ('fr' | 'ar' | 'en').
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['fr', 'ar', 'en'];
export const ACTIVE_LOCALES: readonly Locale[] = ['fr'];
export const DEFAULT_LOCALE: Locale = 'fr';
export const RTL_LOCALES: readonly Locale[] = ['ar'];

export const isRtlLocale = (locale: Locale): boolean => RTL_LOCALES.includes(locale);

/** Langue effective : la préférence si elle est active, sinon le français (V1). */
export function resolveLocale(preferred?: string | null): Locale {
  const match = ACTIVE_LOCALES.find((l) => l === preferred);
  return match ?? DEFAULT_LOCALE;
}

/**
 * Applique le sens d'écriture. Changer de direction nécessite un rechargement de l'app (limite de React Native) :
 * retourne `true` si c'est le cas. En V1 (français) la direction reste LTR.
 */
export function applyLayoutDirection(locale: Locale): boolean {
  const rtl = isRtlLocale(locale);
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
}
