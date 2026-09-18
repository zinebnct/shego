import type fr from './fr.json';

/** Clés de traduction typées : une clé inexistante est une erreur de compilation (« zéro chaîne en dur »). */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof fr };
  }
}
