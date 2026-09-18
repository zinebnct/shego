import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { Text } from '@/components/foundation/Text';

/** Écran 5/11 — placeholder de routage : la saisie fonctionnelle arrive avec la phase Onboarding. Âge < 18 ans : blocage côté serveur (onboarding-complete-profile), message « onboarding.birthDate.minor ». */
export default function DateNaissance() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <OnboardingScaffold
      step={5}
      title={t('onboarding.birthDate.title')}
      subtitle={t('onboarding.birthDate.subtitle')}
      cta={t('common.continue')}
      onContinue={() => router.push('/(onboarding)/ville')}
    >
      <Text variant="caption" tone="tertiary">
        {t('dev.placeholder')}
      </Text>
    </OnboardingScaffold>
  );
}
