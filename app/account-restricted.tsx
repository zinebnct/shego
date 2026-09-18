import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Button } from '@/components/actions/Button';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';
import { useAuth } from '@/hooks/useAuth';

/**
 * Écran dédié `suspended` / `banned` (Design System §14, Onboarding V1.3 §5) : accès hors Home/Create/Chat.
 * Texte factuel LOCKED, sans détail sur la raison exacte. (Lien support : à ajouter quand le canal sera défini.)
 */
export default function AccountRestricted() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  return (
    <Screen>
      <View style={styles.body}>
        <Text variant="h1" accessibilityRole="header">
          {t('account.restricted')}
        </Text>
      </View>
      <Button label={t('common.signOut')} variant="secondary" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { flex: 1, justifyContent: 'center', gap: spacing[3] } });
