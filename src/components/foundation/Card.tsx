import type { ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, usePressScale } from '@/design-system';

export interface CardProps {
  children: ReactNode;
  /** Carte tapable : un seul geste (ouvrir le détail) — jamais d'action secondaire sur la carte. */
  onPress?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Carte : surface blanche sur sable, bordure 1 px chaude, AUCUNE ombre (Design System §2, §7). */
export function Card({ children, onPress, compact = false, style, accessibilityLabel }: CardProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const base = [styles.card, compact ? styles.compact : styles.regular, style];

  if (!onPress) return <View style={base}>{children}</View>;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [base, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
  },
  regular: { borderRadius: radius.xl },
  compact: { borderRadius: radius.lg },
  pressed: { backgroundColor: colors.surface.surfacePressed },
});
