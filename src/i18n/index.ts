import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr.json';
import { DEFAULT_LOCALE, resolveLocale } from './locales';
import type { Locale } from '@/types/domain';

/** Ressources chargées : français uniquement en V1 (ar.json / en.json arriveront avec leurs langues). */
export const resources = { fr: { translation: fr } } as const;

let initialized = false;

/** Idempotent : à appeler une fois au démarrage (root layout) ou dans les tests. */
export function initI18n(locale?: string | null): typeof i18n {
  if (!initialized) {
    // eslint-disable-next-line import/no-named-as-default-member -- API i18next documentée (`i18n.use(...).init`)
    void i18n.use(initReactI18next).init({
      resources,
      lng: resolveLocale(locale),
      fallbackLng: DEFAULT_LOCALE,
      interpolation: { escapeValue: false }, // React échappe déjà
      returnNull: false,
    });
    initialized = true;
  } else if (locale) {
    // eslint-disable-next-line import/no-named-as-default-member -- API i18next documentée
    void i18n.changeLanguage(resolveLocale(locale));
  }
  return i18n;
}

export const currentLocale = (): Locale => resolveLocale(i18n.language);

export { i18n };
export {
  resolveLocale,
  isRtlLocale,
  applyLayoutDirection,
  ACTIVE_LOCALES,
  SUPPORTED_LOCALES,
} from './locales';
