import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/design-system';
import { Button } from '@/components/actions/Button';
import { IconButton } from '@/components/actions/IconButton';
import { Icon } from '@/components/foundation/Icon';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';

/**
 * Écran 2 — Welcome confiance : le SEUL message de principe avant l'auth. Aucune mention de « vérification » ;
 * l'authentification Apple/Google authentifie un compte, pas une personne ni son genre.
 */
export default function WelcomeConfiance() {
  const { t } = useTranslation();
  const router = useRouter();
  const lines = [t('onboarding.welcomeTrust.authenticated'), t('onboarding.welcomeTrust.control')];
  return (
    <Screen
      footer={
        <Button label={t('common.start')} onPress={() => router.push('/(onboarding)/auth')} />
      }
    >
      <IconButton
        icon="chevronBack"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
      />
      <View style={styles.body}>
        <Text variant="displaySm">{t('onboarding.welcomeTrust.headline')}</Text>
        <View style={styles.lines}>
          {lines.map((line) => (
            <View key={line} style={styles.line}>
              <Icon name="check" size="md" color={colors.brand.grenat} />
              <Text variant="body" style={styles.lineText}>
                {line}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing[6] },
  lines: { gap: spacing[3] },
  line: { flexDirection: 'row', gap: spacing[2], alignItems: 'flex-start' },
  lineText: { flex: 1 },
});
