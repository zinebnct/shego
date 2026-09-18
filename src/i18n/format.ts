/** Formats délégués à la locale (Blueprint produit §5) : jamais de concaténation manuelle. Fuseau : Africa/Casablanca, 24 h. */
import type { Locale } from '@/types/domain';

const TIME_ZONE = 'Africa/Casablanca';

export function formatTime(date: Date | string, locale: Locale = 'fr'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}

/** Distance approximative (« à 2 km ») — jamais une position exacte. */
export function formatApproxDistance(meters: number, locale: Locale = 'fr'): string {
  const km = Math.max(1, Math.round(meters / 1000));
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilometer',
    unitDisplay: 'short',
  }).format(km);
}
