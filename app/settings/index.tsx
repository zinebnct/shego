import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Button } from '@/components/actions/Button';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';
import { NavHeader } from '@/components/navigation/NavHeader';
import { useAuth } from '@/hooks/useAuth';

/** Paramètres — squelette. `Se déconnecter` est fonctionnel ; le reste (comptes bloqués, suppression…) arrive plus tard. */
export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing[5], gap: spacing[3] }}>
        <NavHeader title={t('settings.title')} onBack={() => router.back()} />
        <Text variant="caption" tone="tertiary">
          {t('dev.placeholder')}
        </Text>
        <Button label={t('common.signOut')} variant="destructive" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}
