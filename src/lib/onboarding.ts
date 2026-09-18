/**
 * Reprise de l'onboarding « à la dernière étape validée côté serveur » (Onboarding V1.3 §2 point 6, §14) :
 * aucun brouillon local — l'étape suivante se déduit de l'état du profil en base.
 * Les écrans 8-11 (intérêts, bio, permissions) sont optionnels/non persistés : la reprise s'arrête à la photo.
 */
import { isAdult } from './age';
import type { Profile } from '@/types/domain';

/** Ordre exact des 11 écrans (Onboarding V1.3 §3). */
export const ONBOARDING_ROUTES = [
  '/(onboarding)/welcome',
  '/(onboarding)/welcome-confiance',
  '/(onboarding)/auth',
  '/(onboarding)/prenom',
  '/(onboarding)/date-naissance',
  '/(onboarding)/ville',
  '/(onboarding)/photo',
  '/(onboarding)/interets',
  '/(onboarding)/bio',
  '/(onboarding)/permissions-notifications',
  '/(onboarding)/permissions-localisation',
] as const;

export type OnboardingRoute = (typeof ONBOARDING_ROUTES)[number];

/** Première étape obligatoire encore manquante, ou `null` si le profil de base est complet (→ Home). */
export function getNextOnboardingRoute(
  profile: Profile | null,
  now?: Date,
): OnboardingRoute | null {
  if (!profile || !profile.prenom) return '/(onboarding)/prenom';
  if (!isAdult(profile.date_naissance, now)) return '/(onboarding)/date-naissance';
  if (!profile.ville_id) return '/(onboarding)/ville';
  if (!profile.photo_url) return '/(onboarding)/photo';
  return null;
}
