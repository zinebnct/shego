import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/design-system';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { Icon } from '@/components/foundation/Icon';
import { useLocationPermission } from '@/hooks/useLocationPermission';

/**
 * Écran 11/11 — Permission localisation. Refus : la Home s'ouvre quand même en mode « ville entière » (jamais un
 * cul-de-sac). La position n'est jamais stockée ni montrée à d'autres personnes.
 */
export default function PermissionsLocalisation() {
  const { t } = useTranslation();
  const router = useRouter();
  const { request } = useLocationPermission();
  const [loading, setLoading] = useState(false);
  const done = () => router.replace('/(tabs)/home');

  return (
    <OnboardingScaffold
      step={11}
      title={t('onboarding.location.title')}
      subtitle={t('onboarding.location.subtitle')}
      cta={t('common.activate')}
      ctaLoading={loading}
      onContinue={() => {
        setLoading(true);
        void request().finally(() => {
          setLoading(false);
          done();
        });
      }}
      secondaryLabel={t('common.later')}
      onSecondary={done}
    >
      <Icon name="pin" size="xl" color={colors.brand.grenat} />
    </OnboardingScaffold>
  );
}
