import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Button } from '@/components/actions/Button';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';

/** Écran 1 — Welcome. Aucun retour (porte d'entrée unique). Mini-cartes de plan : à venir (composant PlanCard). */
export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button
            label={t('common.start')}
            onPress={() => router.push('/(onboarding)/welcome-confiance')}
          />
          <Button
            label={t('onboarding.welcome.signIn')}
            variant="tertiary"
            onPress={() => router.push('/(onboarding)/auth')}
          />
        </View>
      }
    >
      <View style={styles.body}>
        <Text variant="displayLg">{t('brand.name')}</Text>
        <Text variant="caption" tone="secondary">
          {t('brand.signature')}
        </Text>
        <Text variant="h1" style={styles.headline}>
          {t('onboarding.welcome.headline')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing[2] },
  headline: { marginTop: spacing[6] },
  footer: { gap: spacing[2] },
});
