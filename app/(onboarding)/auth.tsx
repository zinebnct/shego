import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { IconButton } from '@/components/actions/IconButton';
import { AppleGoogleSignInButton } from '@/components/forms/AppleGoogleSignInButton';
import { Banner } from '@/components/feedback/Banner';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';
import { errorMessage } from '@/i18n/errors';
import { signInWithApple, signInWithGoogle } from '@/services/auth.service';
import type { AppError } from '@/types/errors';
import type { Result } from '@/types/result';
import type { Session } from '@supabase/supabase-js';

/**
 * Écran 3 — Auth Apple / Google : deux boutons d'égale importance. Aucun mot de passe, aucun numéro.
 * L'authentification authentifie l'ACCÈS au compte : aucun texte de cet écran ne parle d'identité vérifiée.
 * Après succès, `useProtectedRoute` oriente vers l'étape suivante (Prénom) ou la Home (compte existant complet).
 */
export default function Auth() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const run = async (provider: 'apple' | 'google', signIn: () => Promise<Result<Session>>) => {
    setLoading(provider);
    setError(null);
    const result = await signIn();
    setLoading(null);
    // Annulation volontaire : aucun message, on reste sur l'écran. Échec : message calme, jamais alarmiste.
    if (result.error && result.error.code !== 'auth_cancelled') setError(result.error);
  };

  return (
    <Screen>
      <IconButton
        icon="chevronBack"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
      />
      <View style={styles.body}>
        <Text variant="h1">{t('onboarding.auth.title')}</Text>
        <Text variant="body" tone="secondary">
          {t('onboarding.auth.subtitle')}
        </Text>
        {error ? <Banner tone="error" message={errorMessage(error.code)} /> : null}
        <View style={styles.buttons}>
          <AppleGoogleSignInButton
            provider="apple"
            label={t('onboarding.auth.apple')}
            loading={loading === 'apple'}
            onPress={() => void run('apple', signInWithApple)}
          />
          <AppleGoogleSignInButton
            provider="google"
            label={t('onboarding.auth.google')}
            loading={loading === 'google'}
            onPress={() => void run('google', signInWithGoogle)}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing[3] },
  buttons: { marginTop: spacing[6], gap: spacing[3] },
});
