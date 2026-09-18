import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Banner } from '@/components/feedback/Banner';
import { Screen } from '@/components/foundation/Screen';
import { Text } from '@/components/foundation/Text';
import { ModerationBanner } from '@/components/profile/ModerationBanner';
import { useAccountGate } from '@/hooks/useAccountGate';
import { useAccountReady } from '@/hooks/useAccountReady';
import { useAuth } from '@/hooks/useAuth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Home — squelette. Illustre la règle de priorité des bannières (Home V1.3 §6) : UNE seule à la fois,
 * `under_review` > compte pas prêt > … > hors ligne. La liste des plans reste consultable dans tous les cas.
 */
export default function Home() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { gate, loading } = useAccountReady();
  const { runGateAction } = useAccountGate();
  const { isOffline } = useNetworkStatus();

  const notReadyMessage =
    gate === 'photo'
      ? t('account.gate.photo')
      : gate === 'profile'
        ? t('account.gate.profile')
        : gate === 'profile_and_photo'
          ? t('account.gate.profileAndPhoto')
          : null;
  const actionLabel = gate === 'photo' ? t('common.add') : t('common.continue');

  return (
    <Screen>
      <View style={styles.body}>
        <Text variant="displaySm">{t('brand.name')}</Text>
        {!loading && gate === 'under_review' && profile ? (
          <ModerationBanner status={profile.account_status} />
        ) : null}
        {!loading && notReadyMessage ? (
          <Banner
            tone="info"
            message={notReadyMessage}
            actionLabel={actionLabel}
            onAction={runGateAction}
          />
        ) : null}
        {isOffline && gate === 'none' ? (
          <Banner tone="neutral" message={t('states.offline')} />
        ) : null}
        <Text variant="caption" tone="tertiary">
          {t('dev.placeholder')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { flex: 1, paddingTop: spacing[4], gap: spacing[3] } });
