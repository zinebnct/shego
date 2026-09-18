import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, sizes, spacing, usePressScale } from '@/design-system';
import { Text } from '../foundation/Text';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'destructive' | 'destructiveConfirmed';

export interface ButtonProps {
  /** Verbe d'action, 24 caractères max, jamais « OK » / « Valider » (Design System §9). */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** 52 (défaut) ou 40 (compact, dans une carte). */
  compact?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const palette = {
  primary: {
    bg: colors.brand.grenat,
    pressed: colors.brand.grenat700,
    text: colors.text.surGrenat,
    border: undefined,
  },
  secondary: {
    bg: 'transparent',
    pressed: colors.surface.surfacePressed,
    text: colors.text.encre,
    border: colors.border.strong,
  },
  tertiary: {
    bg: 'transparent',
    pressed: colors.surface.surfacePressed,
    text: colors.brand.grenat,
    border: undefined,
  },
  destructive: {
    bg: 'transparent',
    pressed: colors.status.errorTint,
    text: colors.status.error,
    border: 'rgba(168, 32, 26, 0.4)',
  },
  destructiveConfirmed: {
    bg: colors.status.error,
    pressed: colors.status.error,
    text: colors.text.surGrenat,
    border: undefined,
  },
} as const;

/**
 * Bouton SHEGO (Design System §9) — rayon 16, jamais en pilule. UN seul Grenat plein par écran.
 * `Destructive confirmée` : uniquement en modale de confirmation finale. Le bouton central « + Créer » n'est PAS un
 * Button : c'est un élément structurel de la TabBar (aucun FAB réutilisable).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  compact = false,
  loading = false,
  disabled = false,
  style,
  testID,
}: ButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const inactive = disabled || loading;
  const p = palette[variant];
  const disabledStyle = disabled
    ? { backgroundColor: colors.surface.argile, borderWidth: 0 }
    : null;
  const textColor = disabled ? colors.text.encre45 : p.text;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.base,
          {
            height: compact ? sizes.buttonCompact : sizes.button,
            backgroundColor: pressed ? p.pressed : p.bg,
          },
          p.border ? { borderWidth: 1.5, borderColor: p.border } : null,
          disabledStyle,
        ]}
      >
        {/* La largeur ne change pas en chargement : le libellé reste dans le flux, invisible. */}
        <Text
          variant="button"
          style={{ color: textColor, opacity: loading ? 0 : 1 }}
          numberOfLines={1}
        >
          {label}
        </Text>
        {loading ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.spinner}>
              <ActivityIndicator size="small" color={textColor} />
            </View>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
