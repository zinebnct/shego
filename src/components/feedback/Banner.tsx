import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/design-system';
import { Button } from '../actions/Button';
import { Icon, type IconName } from '../foundation/Icon';
import { Text, type TextTone } from '../foundation/Text';

export type BannerTone = 'info' | 'success' | 'error' | 'neutral';

export interface BannerProps {
  tone?: BannerTone;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

const config: Record<
  BannerTone,
  { bg: string; border: string; text: TextTone; icon: IconName; iconColor: string }
> = {
  // Info : registre calme par défaut des messages de sécurité et de modération (jamais le rouge).
  info: {
    bg: colors.status.infoTint,
    border: 'rgba(44, 90, 140, 0.2)',
    text: 'info',
    icon: 'info',
    iconColor: colors.status.info,
  },
  success: {
    bg: colors.status.successTint,
    border: 'rgba(18, 119, 94, 0.2)',
    text: 'success',
    icon: 'check',
    iconColor: colors.status.success,
  },
  error: {
    bg: colors.status.errorTint,
    border: 'rgba(168, 32, 26, 0.2)',
    text: 'error',
    icon: 'info',
    iconColor: colors.status.error,
  },
  // Hors ligne : bannière Argile persistante.
  neutral: {
    bg: colors.surface.argile,
    border: colors.border.default,
    text: 'secondary',
    icon: 'info',
    iconColor: colors.text.encre70,
  },
};

/**
 * Bannière (Design System §14, §16) : icône + mot, jamais la couleur seule. Annoncée à l'apparition (région live
 * polie) — jamais de rôle `alert` alarmiste, surtout pour `under_review`. Texte lu intégralement, sur deux lignes
 * plutôt qu'en ellipse.
 */
export function Banner({ tone = 'info', message, actionLabel, onAction, testID }: BannerProps) {
  const c = config[tone];
  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      style={[styles.base, { backgroundColor: c.bg, borderColor: c.border }]}
    >
      <View style={styles.row}>
        <Icon name={c.icon} size="md" color={c.iconColor} />
        <Text variant="caption" tone={c.text} style={styles.message}>
          {message}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} variant="tertiary" compact />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, borderWidth: 1, padding: spacing[3] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  message: { flex: 1 },
  action: { alignSelf: 'flex-start', marginTop: spacing[1] },
});
