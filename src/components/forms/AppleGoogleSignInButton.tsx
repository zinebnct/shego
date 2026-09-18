import { Platform, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { radius, sizes } from '@/design-system';
import { Button } from '../actions/Button';

export interface AppleGoogleSignInButtonProps {
  provider: 'apple' | 'google';
  /** Libellé i18n (`onboarding.auth.apple` / `onboarding.auth.google`). */
  label: string;
  onPress: () => void;
  loading?: boolean;
}

/**
 * Boutons d'authentification de l'écran 3 : deux boutons d'égale importance.
 * iOS + Apple : bouton NATIF Apple (noir, obligatoire dès qu'une autre méthode tierce est proposée — App Store 4.8).
 * Ailleurs : bouton SHEGO standard. Ils authentifient l'accès au compte — jamais une identité ni un genre.
 */
export function AppleGoogleSignInButton({
  provider,
  label,
  onPress,
  loading = false,
}: AppleGoogleSignInButtonProps) {
  if (provider === 'apple' && Platform.OS === 'ios') {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={radius.lg}
        style={styles.native}
        onPress={loading ? () => undefined : onPress}
      />
    );
  }
  return (
    <Button
      label={label}
      onPress={onPress}
      loading={loading}
      variant={provider === 'apple' ? 'primary' : 'secondary'}
    />
  );
}

const styles = StyleSheet.create({
  native: { height: sizes.button, width: '100%' },
});
