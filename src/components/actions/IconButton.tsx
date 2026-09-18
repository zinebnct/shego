import { Pressable, StyleSheet } from 'react-native';
import { colors, sizes } from '@/design-system';
import { Icon, type IconName } from '../foundation/Icon';

export interface IconButtonProps {
  icon: IconName;
  /** Obligatoire : une icône seule n'est jamais le seul porteur de sens (Design System §6 règle 2). */
  accessibilityLabel: string;
  onPress: () => void;
  color?: string;
  testID?: string;
}

/** Icon button : zone tactile 44 × 44 minimum (Design System §6 règle 1). */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = colors.text.encre70,
  testID,
}: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <Icon name={icon} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sizes.touchTarget / 2,
  },
  pressed: { backgroundColor: colors.surface.surfacePressed },
});
