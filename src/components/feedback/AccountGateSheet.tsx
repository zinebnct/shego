import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/design-system';
import type { AccountGate } from '@/lib/account-readiness';
import { Button } from '../actions/Button';
import { Icon, type IconName } from '../foundation/Icon';
import { Text } from '../foundation/Text';
import { BottomSheet } from './BottomSheet';

export interface AccountGateSheetProps {
  visible: boolean;
  gate: AccountGate;
  onClose: () => void;
  /** Action du bouton (`Ajouter` / `Continuer`) : renvoie vers l'écran de complétion concerné. */
  onAction: () => void;
}

type Content = { icon: IconName; message: string; actionLabel?: string };

/**
 * COMPOSANT TRANSVERSE CRITIQUE (Technical Blueprint V1.3 §4) : feuille « ce qui manque » (Create Plan V1.3 §12.1) et
 * feuille `under_review` (§12.2, Plan Detail §13bis). UN SEUL composant, invoqué depuis tous les points d'entrée
 * (bouton « + Créer », Rejoindre, Ouvrir le chat) via `AccountGateProvider` — jamais dupliqué par écran.
 *
 * Un seul message, correspondant PRÉCISÉMENT à ce qui manque. `under_review` : feuille d'information non actionnable,
 * registre Info calme — aucun bouclier, aucune coche, aucun badge, aucune mention de « vérification ».
 */
export function AccountGateSheet({ visible, gate, onClose, onAction }: AccountGateSheetProps) {
  const { t } = useTranslation();

  const content: Content | null = (() => {
    switch (gate) {
      case 'photo':
        return { icon: 'camera', message: t('account.gate.photo'), actionLabel: t('common.add') };
      case 'profile':
        return {
          icon: 'user',
          message: t('account.gate.profile'),
          actionLabel: t('common.continue'),
        };
      case 'profile_and_photo':
        return {
          icon: 'user',
          message: t('account.gate.profileAndPhoto'),
          actionLabel: t('common.continue'),
        };
      case 'under_review':
        return { icon: 'info', message: t('account.underReview') };
      case 'restricted':
        return {
          icon: 'info',
          message: t('account.restricted'),
          actionLabel: t('common.continue'),
        };
      case 'no_session':
        return {
          icon: 'user',
          message: t('onboarding.auth.title'),
          actionLabel: t('common.continue'),
        };
      case 'none':
        return null;
    }
  })();

  return (
    <BottomSheet
      visible={visible && content !== null}
      onClose={onClose}
      closeLabel={t('common.close')}
      testID="account-gate-sheet"
    >
      {content ? (
        <View style={styles.body}>
          <Icon
            name={content.icon}
            size="xl"
            color={gate === 'under_review' ? colors.status.info : colors.text.encre70}
          />
          <Text variant="body" style={styles.message} accessibilityRole="text">
            {content.message}
          </Text>
          {content.actionLabel ? (
            <Button label={content.actionLabel} onPress={onAction} style={styles.action} />
          ) : null}
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', paddingBottom: spacing[2] },
  message: { textAlign: 'center', marginTop: spacing[4], marginBottom: spacing[6] },
  action: { alignSelf: 'stretch' },
});
