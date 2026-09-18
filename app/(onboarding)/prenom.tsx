import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { TextField } from '@/components/forms/TextField';

const MIN_LENGTH = 2;
const MAX_LENGTH = 30;

/** Écran 4/11 — Prénom : 30 caractères max, CTA actif dès 2 caractères ; filtre de mots interdits côté serveur. */
export default function Prenom() {
  const { t } = useTranslation();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const tooShort = value.trim().length < MIN_LENGTH;

  return (
    <OnboardingScaffold
      step={4}
      title={t('onboarding.firstName.title')}
      subtitle={t('onboarding.firstName.subtitle')}
      cta={t('common.continue')}
      onContinue={() => {
        setSubmitted(true);
        if (!tooShort) router.push('/(onboarding)/date-naissance');
      }}
    >
      <TextField
        label={t('onboarding.firstName.title')}
        value={value}
        onChangeText={setValue}
        maxLength={MAX_LENGTH}
        autoCapitalize="words"
        autoComplete="given-name"
        error={submitted && tooShort ? t('onboarding.firstName.error') : undefined}
      />
    </OnboardingScaffold>
  );
}
