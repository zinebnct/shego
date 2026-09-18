import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/design-system';
import { OnboardingScaffold } from '@/components/forms/OnboardingScaffold';
import { Icon } from '@/components/foundation/Icon';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';

/**
 * Écran 10/11 — Permission notifications : explication maison AVANT le prompt système. Un refus ne bloque jamais :
 * on passe à l'écran suivant quel que soit le choix (`notifications_opt_in = false`, aucune relance intrusive).
 */
export default function PermissionsNotifications() {
  const { t } = useTranslation();
  const router = useRouter();
  const { request } = useNotificationPermission();
  const [loading, setLoading] = useState(false);
  const next = () => router.push('/(onboarding)/permissions-localisation');

  return (
    <OnboardingScaffold
      step={10}
      title={t('onboarding.notifications.title')}
      subtitle={t('onboarding.notifications.subtitle')}
      cta={t('common.activate')}
      ctaLoading={loading}
      onContinue={() => {
        setLoading(true);
        void request().finally(() => {
          setLoading(false);
          next();
        });
      }}
      secondaryLabel={t('common.later')}
      onSecondary={next}
    >
      <Icon name="bell" size="xl" color={colors.brand.grenat} />
    </OnboardingScaffold>
  );
}
