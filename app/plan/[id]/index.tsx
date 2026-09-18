import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Button } from '@/components/actions/Button';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';
import { NavHeader } from '@/components/navigation/NavHeader';
import { useAccountGate } from '@/hooks/useAccountGate';

/**
 * Plan Detail — squelette. Le détail reste consultable pour tous ; « Rejoindre » passe par la MÊME feuille partagée
 * que « + Créer » (AccountGateSheet) tant que le compte n'est pas prêt ou est `under_review`.
 * Le branchement de participation.service.joinPlan arrive avec la phase JOIN + CHAT.
 */
export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { requireReady } = useAccountGate();

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing[5], gap: spacing[3] }}>
        <NavHeader title={id ?? ''} onBack={() => router.back()} />
        <Text variant="caption" tone="tertiary">
          {t('dev.placeholder')}
        </Text>
        <Button label={t('plans.join')} onPress={() => requireReady(() => undefined)} />
      </View>
    </Screen>
  );
}
