import type { AccountStatus } from '@/lib/account-status';
import type { CategoryKey, ParticipationMode } from './categories';
import type { Tables } from './database.types';

export type AuthProvider = 'apple' | 'google';
export type Locale = 'fr' | 'ar' | 'en';

/** Mon profil (ligne `users` de la personne connectée). Aucun champ de contact téléphonique. */
export type Profile = Omit<Tables<'users'>, 'account_status' | 'auth_provider' | 'locale'> & {
  account_status: AccountStatus;
  auth_provider: AuthProvider;
  locale: Locale;
};

/** Profil d'une autre utilisatrice : Avatar · Prénom · Âge · Ville (+ bio). Jamais la date de naissance. */
export interface PublicProfile {
  id: string;
  prenom: string;
  age: number | null;
  ville_id: string | null;
  bio: string | null;
  photo_url: string | null;
}

export type PlanStatus = 'actif' | 'complet' | 'annule' | 'passe';
export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'removed';

/** Plan tel que visible AVANT de rejoindre : `lieu_public` + quartier, jamais l'adresse exacte (règle 15.1). */
export interface PlanPublic {
  id: string;
  creator_id: string;
  categorie_cle: CategoryKey;
  titre: string;
  description: string | null;
  lieu_public: string;
  quartier: string;
  date_heure: string;
  places_max: number;
  participation_mode: ParticipationMode;
  status: PlanStatus;
  city_id: string;
}

/** Plan avec adresse exacte : créatrice ou participante acceptée uniquement (vue `plans_full`). */
export interface PlanFull extends PlanPublic {
  adresse_exacte: string | null;
}

export type MessageType = 'user' | 'system';

export interface ChatMessage {
  id: string;
  plan_id: string;
  sender_id: string | null;
  contenu: string;
  type: MessageType;
  created_at: string;
}

export interface BlockedUser {
  blocked_id: string;
  prenom: string | null;
  photo_url: string | null;
  created_at: string;
}

export type ReportTargetType = 'user' | 'plan' | 'message';
export type ReportMotif =
  'contenu_inapproprie' | 'harcelement' | 'profil_suspect' | 'probleme_securite' | 'autre';
