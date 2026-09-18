import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { Text } from '@/components/foundation/Text';

/** Écran 6/11 — placeholder de routage : la saisie fonctionnelle arrive avec la phase Onboarding. Ville unique en V1 (Casablanca), présélectionnée. */
export default function Ville() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <OnboardingScaffold
      step={6}
      title={t('onboarding.city.title')}
      subtitle={t('onboarding.city.subtitle')}
      cta={t('common.continue')}
      onContinue={() => router.push('/(onboarding)/photo')}
    >
      <Text variant="caption" tone="tertiary">
        {t('dev.placeholder')}
      </Text>
    </OnboardingScaffold>
  );
}
