import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { TextField } from '@/components/forms/TextField';

const BIO_MAX_LENGTH = 150;

/** Écran 9/11 — Bio (optionnelle, 150 caractères, compteur permanent). Aucun élément orienté dating. */
export default function Bio() {
  const { t } = useTranslation();
  const router = useRouter();
  const [value, setValue] = useState('');
  const next = () => router.push('/(onboarding)/permissions-notifications');

  return (
    <OnboardingScaffold
      step={9}
      title={t('onboarding.bio.title')}
      cta={t('common.continue')}
      onContinue={next}
      secondaryLabel={t('common.skip')}
      onSecondary={next}
    >
      <TextField
        label={t('onboarding.bio.title')}
        value={value}
        onChangeText={setValue}
        maxLength={BIO_MAX_LENGTH}
        multiline
        showCounter
      />
    </OnboardingScaffold>
  );
}
