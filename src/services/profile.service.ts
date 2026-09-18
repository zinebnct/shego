/**
 * Profil — Technical Blueprint V1.3 §21 : getMe, updateProfile, uploadPhoto, deleteAccount.
 * Écritures côté client limitées aux colonnes de profil (privilèges de colonne, migration 4) :
 * `account_status` n'est JAMAIS modifiable par l'app.
 */
import * as ImageManipulator from 'expo-image-manipulator';
import { isAccountStatus } from '@/lib/account-status';
import { getDeviceId } from '@/lib/device';
import { supabase } from '@/lib/supabase';
import type { PublicProfile, Profile } from '@/types/domain';
import type { Tables, TablesUpdate, Views } from '@/types/database.types';
import { appError } from '@/types/errors';
import { fail, ok, type Result } from '@/types/result';
import { EDGE_FUNCTIONS, fromSupabase, invokeFunction, toAppError } from './_internal';
import { getCurrentUserId, signOut } from './auth.service';

const AVATAR_BUCKET = 'avatars';
/** Photo redimensionnée côté client avant upload (Blueprint §11) — aucun traitement serveur en V1. */
const AVATAR_MAX_WIDTH = 1024;
const AVATAR_JPEG_QUALITY = 0.8;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function toProfile(row: Tables<'users'>): Profile | null {
  if (!isAccountStatus(row.account_status)) return null;
  if (row.auth_provider !== 'apple' && row.auth_provider !== 'google') return null;
  const locale = row.locale === 'ar' || row.locale === 'en' ? row.locale : 'fr';
  return { ...row, account_status: row.account_status, auth_provider: row.auth_provider, locale };
}

/** Mon profil. `data === null` : session sans ligne `users` (ne devrait pas arriver — trigger de création). */
export async function getMe(): Promise<Result<Profile | null>> {
  const userId = await getCurrentUserId();
  if (!userId) return fail(appError('unauthorized'));
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (error) return fail(await toAppError(error));
    return ok(data ? toProfile(data) : null);
  } catch (e) {
    return fail(await toAppError(e));
  }
}

export type ProfileUpdate = TablesUpdate<'users'>;

export async function updateProfile(patch: ProfileUpdate): Promise<Result<Profile>> {
  const userId = await getCurrentUserId();
  if (!userId) return fail(appError('unauthorized'));
  const result = await fromSupabase(
    supabase.from('users').update(patch).eq('id', userId).select('*').single(),
  );
  if (result.error) return fail(result.error);
  const profile = toProfile(result.data);
  return profile ? ok(profile) : fail(appError('unknown', 'invalid_profile_row'));
}

export interface OnboardingProfileInput {
  prenom: string;
  dateNaissance: string; // YYYY-MM-DD
  villeId: string;
  bio?: string;
  interestIds?: string[];
}

/**
 * Finalise le profil après Sign in with Apple/Google (Edge Function `onboarding-complete-profile`) : applique
 * la contrainte 18+ côté serveur, le filtre lexical, et collecte le signal `device_id` (non biométrique).
 */
export async function completeOnboardingProfile(
  input: OnboardingProfileInput,
): Promise<Result<Profile>> {
  const deviceId = await getDeviceId();
  const result = await invokeFunction<Tables<'users'>>(EDGE_FUNCTIONS.onboardingCompleteProfile, {
    prenom: input.prenom,
    date_naissance: input.dateNaissance,
    ville_id: input.villeId,
    bio: input.bio ?? null,
    interests: input.interestIds ?? [],
    device_id: deviceId,
  });
  if (result.error) return fail(result.error);
  const profile = toProfile(result.data);
  return profile ? ok(profile) : fail(appError('unknown', 'invalid_profile_row'));
}

/**
 * Photo de profil : redimensionnement JPEG côté client, upload vers `avatars/{user_id}/profile.jpg`
 * (fichier unique, écrasé au remplacement), puis enregistrement du chemin dans `users.photo_url`.
 * La photo est un élément de reconnaissance IRL — aucune détection de visage, aucune vérification.
 */
export async function uploadPhoto(localUri: string): Promise<Result<Profile>> {
  const userId = await getCurrentUserId();
  if (!userId) return fail(appError('unauthorized'));
  try {
    const context = ImageManipulator.ImageManipulator.manipulate(localUri);
    context.resize({ width: AVATAR_MAX_WIDTH });
    const rendered = await context.renderAsync();
    const image = await rendered.saveAsync({
      format: ImageManipulator.SaveFormat.JPEG,
      compress: AVATAR_JPEG_QUALITY,
    });

    const body = await (await fetch(image.uri)).arrayBuffer();
    const path = `${userId}/profile.jpg`;
    const upload = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, body, { contentType: 'image/jpeg', upsert: true });
    if (upload.error) return fail(appError('photo_upload_failed', upload.error.message));

    return updateProfile({ photo_url: path });
  } catch (e) {
    return fail(appError('photo_upload_failed', e instanceof Error ? e.message : undefined));
  }
}

/** URL signée de courte durée : le bucket `avatars` est privé (lecture filtrée par la RLS Storage). */
export async function getPhotoUrl(photoPath: string): Promise<Result<string>> {
  try {
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);
    if (error || !data) return fail(await toAppError(error ?? new Error('no_signed_url')));
    return ok(data.signedUrl);
  } catch (e) {
    return fail(await toAppError(e));
  }
}

/** Profil d'une AUTRE utilisatrice, uniquement depuis un contexte de plan (vue `public_profiles`, jamais d'annuaire). */
export async function getPublicProfile(userId: string): Promise<Result<PublicProfile>> {
  const result = await fromSupabase(
    supabase
      .from('public_profiles')
      .select('id, prenom, age, ville_id, bio, photo_url')
      .eq('id', userId)
      .maybeSingle(),
  );
  if (result.error) return fail(result.error);
  const row: Views<'public_profiles'> = result.data;
  if (!row.id || !row.prenom) return fail(appError('not_found'));
  return ok({
    id: row.id,
    prenom: row.prenom,
    age: row.age,
    ville_id: row.ville_id,
    bio: row.bio,
    photo_url: row.photo_url,
  });
}

/** Supprime le compte (photo, données de profil, liaison Apple/Google — Safety Layer §13) puis la session locale. */
export async function deleteAccount(): Promise<Result<true>> {
  const result = await invokeFunction<{ ok: true }>(EDGE_FUNCTIONS.accountDelete);
  if (result.error) return fail(result.error);
  return signOut();
}
