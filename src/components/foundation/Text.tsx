import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { MAX_FONT_SIZE_MULTIPLIER, colors, typography, type TextVariant } from '@/design-system';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'onPrimary'
  | 'primary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

const toneColor: Record<TextTone, string> = {
  default: colors.text.encre,
  secondary: colors.text.encre70,
  tertiary: colors.text.encre45,
  onPrimary: colors.text.surGrenat,
  primary: colors.brand.grenat,
  error: colors.status.error,
  info: colors.status.info,
  success: colors.status.success,
  warning: colors.status.warning,
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

/**
 * Texte SHEGO (Design System §4). Toute chaîne visible passe par i18n (`t(...)`) — jamais de texte en dur.
 * Dynamic Type plafonné à 120 %. Pas de majuscules intégrales, pas d'italique.
 */
export function Text({ variant = 'body', tone = 'default', style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
      {...rest}
      style={[typography[variant], { color: toneColor[tone] }, style]}
    />
  );
}
