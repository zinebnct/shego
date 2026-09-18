import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import {
  MAX_FONT_SIZE_MULTIPLIER,
  colors,
  radius,
  sizes,
  spacing,
  typography,
} from '@/design-system';
import { Text } from '../foundation/Text';

export interface TextFieldProps extends Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'maxLength'
  | 'testID'
> {
  /** Label AU-DESSUS du champ, jamais flottant (Design System §15). */
  label: string;
  helper?: string;
  /** Message d'erreur : bordure Error + texte, annoncé au lecteur d'écran (jamais la couleur seule). */
  error?: string;
  multiline?: boolean;
  /** Affiche `n/max` (ex. bio `0/150`). */
  showCounter?: boolean;
}

/** Champ de saisie : hauteur 52, rayon 14, fond Argile au repos, contour fort au focus. Validation à la soumission. */
export function TextField({
  label,
  helper,
  error,
  multiline = false,
  showCounter = false,
  value,
  maxLength,
  ...input
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.status.error : focused ? colors.border.strong : 'transparent';

  return (
    <View>
      <Text variant="label" tone="secondary" style={styles.label}>
        {label}
      </Text>
      <TextInput
        {...input}
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholderTextColor={colors.text.encre45}
        maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          typography.body,
          multiline && styles.multiline,
          {
            borderColor,
            backgroundColor: error ? colors.status.errorTint : colors.surface.argile,
            color: colors.text.encre,
          },
        ]}
      />
      <View style={styles.footer}>
        <Text
          variant="caption"
          tone={error ? 'error' : 'secondary'}
          accessibilityLiveRegion="polite"
          style={styles.footerText}
        >
          {error ?? helper ?? ''}
        </Text>
        {showCounter && maxLength ? (
          <Text variant="caption" tone="tertiary">{`${value?.length ?? 0}/${maxLength}`}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: spacing[2] },
  input: {
    minHeight: sizes.input,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing[4],
  },
  multiline: { minHeight: 120, paddingTop: spacing[3], textAlignVertical: 'top' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[1] },
  footerText: { flex: 1 },
});
