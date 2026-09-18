import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { Text } from '@/components/foundation/Text';

/** Écran 7/11 — placeholder de routage : la saisie fonctionnelle arrive avec la phase Onboarding. Photo OBLIGATOIRE : brancher expo-image-picker + profile.service.uploadPhoto (jamais présentée comme une vérification). */
export default function Photo() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <OnboardingScaffold
      step={7}
      title={t('onboarding.photo.title')}
      subtitle={t('onboarding.photo.subtitle')}
      cta={t('common.continue')}
      onContinue={() => router.push('/(onboarding)/interets')}
    >
      <Text variant="caption" tone="tertiary">
        {t('dev.placeholder')}
      </Text>
    </OnboardingScaffold>
  );
}
