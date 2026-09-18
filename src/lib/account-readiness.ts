/**
 * CONDITION D'ACCÈS « compte prêt à participer » — Blueprint produit §6.4 (LOCKED), miroir TS de la fonction SQL
 * `fn_is_account_ready`. Fonction PURE, partagée par le hook `useAccountReady`, les guards de navigation et les
 * actions Create / Join / Chat. Le serveur reste la barrière réelle (RLS + Edge Functions).
 *
 *   1. session Apple/Google valide      4. ville renseignée
 *   2. prénom renseigné                 5. photo de profil présente
 *   3. date de naissance renseignée, 18+ confirmé par le calcul
 *   6. account_status = 'active'
 *
 * Aucune preuve d'identité ni de genre n'est jamais demandée ; aucune condition ne dépend d'un numéro.
 */
import { isAdult } from './age';
import { canCreateJoinChat, isAccessBlocked, isUnderReview } from './account-status';
import type { Profile } from '@/types/domain';

export type MissingRequirement =
  'session' | 'prenom' | 'date_naissance' | 'ville' | 'photo' | 'account_status';

/**
 * Feuille à afficher quand l'accès est refusé (un SEUL message, correspondant précisément à ce qui manque) :
 *   none              — prêt
 *   no_session        — pas de session Apple/Google
 *   profile           — « Termine ton profil… » (prénom, date de naissance ou ville manquants)
 *   photo             — « Ajoute une photo… »
 *   profile_and_photo — « Termine ton profil et ajoute une photo… »
 *   under_review      — feuille d'information non actionnable
 *   restricted        — suspended | banned : écran dédié
 */
export type AccountGate =
  'none' | 'no_session' | 'profile' | 'photo' | 'profile_and_photo' | 'under_review' | 'restricted';

export interface AccountReadiness {
  ready: boolean;
  gate: AccountGate;
  missing: MissingRequirement[];
}

export interface ReadinessInput {
  hasSession: boolean;
  profile: Profile | null;
  now?: Date;
}

export function evaluateAccountReadiness({
  hasSession,
  profile,
  now,
}: ReadinessInput): AccountReadiness {
  if (!hasSession) return { ready: false, gate: 'no_session', missing: ['session'] };
  if (!profile)
    return {
      ready: false,
      gate: 'profile_and_photo',
      missing: ['prenom', 'date_naissance', 'ville', 'photo'],
    };

  const missing: MissingRequirement[] = [];
  if (!profile.prenom) missing.push('prenom');
  if (!isAdult(profile.date_naissance, now)) missing.push('date_naissance');
  if (!profile.ville_id) missing.push('ville');
  if (!profile.photo_url) missing.push('photo');
  if (!canCreateJoinChat(profile.account_status)) missing.push('account_status');

  if (missing.length === 0) return { ready: true, gate: 'none', missing };

  // Priorité (Home §6) : compte restreint > under_review > profil/photo manquants.
  if (isAccessBlocked(profile.account_status)) return { ready: false, gate: 'restricted', missing };
  if (isUnderReview(profile.account_status)) return { ready: false, gate: 'under_review', missing };

  const profileMissing = missing.some(
    (m) => m === 'prenom' || m === 'date_naissance' || m === 'ville',
  );
  const photoMissing = missing.includes('photo');
  const gate: AccountGate =
    profileMissing && photoMissing ? 'profile_and_photo' : photoMissing ? 'photo' : 'profile';
  return { ready: false, gate, missing };
}
