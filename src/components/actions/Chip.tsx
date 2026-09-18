import { Pressable, StyleSheet } from 'react-native';
import { colors, radius, sizes, spacing } from '@/design-system';
import { Text } from '../foundation/Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Teinte de catégorie : sélection en teinte de la catégorie plutôt qu'en Grenat (Design System §10). */
  categoryTint?: string;
  disabled?: boolean;
  testID?: string;
}

/** Chip de filtre : hauteur 36, rayon 10 (`radius.sm`), padding horizontal 14. */
export function Chip({
  label,
  selected = false,
  onPress,
  categoryTint,
  disabled = false,
  testID,
}: ChipProps) {
  const selectedBg = categoryTint ?? colors.brand.grenat;
  const selectedText = categoryTint ? colors.text.encre : colors.text.surGrenat;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected
          ? { backgroundColor: selectedBg, borderColor: selectedBg }
          : {
              backgroundColor: pressed ? colors.surface.surfacePressed : colors.surface.surface,
              borderColor: colors.border.default,
            },
        disabled && styles.disabled,
      ]}
    >
      <Text
        variant="label"
        style={{
          color: selected ? selectedText : disabled ? colors.text.encre45 : colors.text.encre,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.chip,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing[2],
  },
  disabled: { backgroundColor: colors.surface.argile },
});
