import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { Text } from '@/components/foundation/Text';

/** Écran 8/11 — placeholder de routage : la saisie fonctionnelle arrive avec la phase Onboarding. Chips des 12 catégories ; aucune logique de matching entre personnes. */
export default function Interets() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <OnboardingScaffold
      step={8}
      title={t('onboarding.interests.title')}
      subtitle={t('onboarding.interests.subtitle')}
      cta={t('common.continue')}
      onContinue={() => router.push('/(onboarding)/bio')}
      secondaryLabel={t('common.skip')}
      onSecondary={() => router.push('/(onboarding)/bio')}
    >
      <Text variant="caption" tone="tertiary">
        {t('dev.placeholder')}
      </Text>
    </OnboardingScaffold>
  );
}
