import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';
import { NavHeader } from '@/components/navigation/NavHeader';
import { useAccountGate } from '@/hooks/useAccountGate';
import { useAccountReady } from '@/hooks/useAccountReady';

/**
 * Create Plan — modal plein écran, hors de la pile Tabs. Le formulaire n'est JAMAIS la barrière de sécurité : si le compte
 * n'est pas prêt (ou `under_review`), l'entrée directe par la route est aussi refoulée vers la feuille partagée ;
 * `plans-create` et la RLS revérifient tout côté serveur.
 */
export default function CreatePlan() {
  const { t } = useTranslation();
  const router = useRouter();
  const { ready, loading } = useAccountReady();
  const { openGate } = useAccountGate();

  useEffect(() => {
    if (!loading && !ready) {
      openGate();
      router.back();
    }
  }, [loading, ready, openGate, router]);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing[5], gap: spacing[3] }}>
        <NavHeader title={t('tabs.create')} onBack={() => router.back()} />
        <Text variant="caption" tone="tertiary">
          {t('dev.placeholder')}
        </Text>
      </View>
    </Screen>
  );
}
