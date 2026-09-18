import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';
import { NavHeader } from '@/components/navigation/NavHeader';
import { useAccountGate } from '@/hooks/useAccountGate';
import { useAccountReady } from '@/hooks/useAccountReady';
import { usePlanChat } from '@/hooks/usePlanChat';

/**
 * Plan Chat — squelette. `under_review` ⇒ aucun Chat, y compris pour un plan déjà rejoint : l'écran n'ouvre ni canal
 * Realtime ni lecture et affiche la feuille d'information (règle binaire, Blueprint produit §6.4bis). La RLS de
 * `messages` refuse de toute façon lecture et écriture aux comptes non actifs.
 */
export default function PlanChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { ready, loading } = useAccountReady();
  const { openGate } = useAccountGate();
  usePlanChat(id ?? '', ready);

  useEffect(() => {
    if (!loading && !ready) {
      openGate();
      router.back();
    }
  }, [loading, ready, openGate, router]);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing[5], gap: spacing[3] }}>
        <NavHeader title={id ?? ''} onBack={() => router.back()} />
        <Text variant="caption" tone="tertiary">
          {t('dev.placeholder')}
        </Text>
      </View>
    </Screen>
  );
}
