/**
 * Authentification — Sign in with Apple / Sign in with Google via Supabase Auth (Technical Blueprint V1.3 §10).
 *
 * Ce service AUTHENTIFIE L'ACCÈS AU COMPTE. Il ne prouve ni l'identité ni le genre, et ne doit jamais être présenté
 * comme tel (Blueprint produit §6.2, §6.5). Aucun numéro de téléphone, aucun code à usage unique, aucun mot de passe.
 *
 * Trois flux, clairement séparés :
 *   - iOS (natif)        : expo-apple-authentication → identityToken → signInWithIdToken            (signInWithAppleNative)
 *   - Android / autres   : signInWithOAuth + expo-web-browser (Services ID Apple), échange PKCE    (signInWithAppleOAuth)
 *   - Google (iOS+Android): SDK natif → idToken → signInWithIdToken                                 (signInWithGoogle)
 */
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { appError } from '@/types/errors';
import { fail, ok, type Result } from '@/types/result';
import { toAppError } from './_internal';

WebBrowser.maybeCompleteAuthSession();

// ---------------------------------------------------------------------------
// Sign in with Apple
// ---------------------------------------------------------------------------

/** iOS : bouton natif (Face ID/Touch ID gérés par Apple, aucune donnée biométrique ne nous parvient). */
async function signInWithAppleNative(): Promise<Result<Session>> {
  try {
    // Nonce : la version hachée va à Apple, la version brute à Supabase (protection contre le rejeu de jeton).
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) return fail(appError('auth_failed', 'apple_no_identity_token'));

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });
    if (error || !data.session) return fail(await toAppError(error ?? new Error('no_session')));
    return ok(data.session);
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED')
      return fail(appError('auth_cancelled'));
    return fail(appError('auth_failed', e instanceof Error ? e.message : undefined));
  }
}

/**
 * Android (et tout appareil sans Sign in with Apple natif) : Apple ne fournit AUCUN SDK Android.
 * Flux OAuth « web » : session sécurisée expo-web-browser → redirection `shego://auth/callback` → échange PKCE.
 * Nécessite un Services ID Apple distinct de l'App ID et le renouvellement du secret JWT Apple tous les 6 mois.
 */
async function signInWithAppleOAuth(): Promise<Result<Session>> {
  try {
    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return fail(await toAppError(error ?? new Error('no_oauth_url')));

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return fail(appError('auth_cancelled'));

    const code = new URL(result.url).searchParams.get('code');
    if (!code) return fail(appError('auth_failed', 'apple_oauth_no_code'));

    const exchange = await supabase.auth.exchangeCodeForSession(code);
    if (exchange.error || !exchange.data.session) {
      return fail(await toAppError(exchange.error ?? new Error('no_session')));
    }
    return ok(exchange.data.session);
  } catch (e) {
    return fail(appError('auth_failed', e instanceof Error ? e.message : undefined));
  }
}

export async function signInWithApple(): Promise<Result<Session>> {
  if (Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync())) {
    return signInWithAppleNative();
  }
  return signInWithAppleOAuth();
}

// ---------------------------------------------------------------------------
// Sign in with Google (SDK natif sur iOS et Android — même flux)
// ---------------------------------------------------------------------------
export async function signInWithGoogle(): Promise<Result<Session>> {
  try {
    // Import dynamique : module natif absent d'Expo Go — l'app reste démarrable, l'erreur ne survient qu'au tap.
    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } =
      await import('@react-native-google-signin/google-signin');
    if (!env.googleWebClientId)
      return fail(appError('auth_unavailable', 'missing_google_web_client_id'));

    GoogleSignin.configure({
      webClientId: env.googleWebClientId, // requis par Supabase Auth pour valider l'id_token
      iosClientId: env.googleIosClientId || undefined,
    });

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return fail(appError('auth_cancelled'));

      const idToken = response.data.idToken;
      if (!idToken) return fail(appError('auth_failed', 'google_no_id_token'));

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error || !data.session) return fail(await toAppError(error ?? new Error('no_session')));
      return ok(data.session);
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED)
        return fail(appError('auth_cancelled'));
      return fail(appError('auth_failed', e instanceof Error ? e.message : undefined));
    }
  } catch (e) {
    return fail(appError('auth_unavailable', e instanceof Error ? e.message : undefined));
  }
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
export async function signOut(): Promise<Result<true>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return fail(await toAppError(error));
    // Déconnexion du SDK Google (silencieuse si jamais utilisé).
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    } catch {
      /* Google jamais utilisé, ou module natif indisponible */
    }
    return ok(true);
  } catch (e) {
    return fail(await toAppError(e));
  }
}

/** Récupération de la session persistée (Keychain/Keystore). `data === null` : aucune session. */
export async function getSession(): Promise<Result<Session | null>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return fail(await toAppError(error));
    return ok(data.session);
  } catch (e) {
    return fail(await toAppError(e));
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const result = await getSession();
  return result.data?.user.id ?? null;
}

/** Abonnement aux changements de session. Retourne la fonction de désabonnement. */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}
