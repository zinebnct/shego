import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/design-system';
import { useScreenMargin } from '@/hooks/useScreenMargin';

export interface ScreenProps {
  children: ReactNode;
  /** CTA plein largeur collé en bas (gabarit d'onboarding — jamais dans le flux). */
  footer?: ReactNode;
  scroll?: boolean;
  /** Marge latérale d'écran (20, ou 16 ≤ 360 pt). */
  padded?: boolean;
  edges?: readonly Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}

/** Conteneur d'écran : fond Sable, marges latérales constantes, zones sûres, pied de page collant. */
export function Screen({
  children,
  footer,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  contentStyle,
}: ScreenProps) {
  const margin = useScreenMargin();
  const side = padded ? { paddingHorizontal: margin } : null;

  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, side, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, side, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, side]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.sable },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  footer: { paddingTop: spacing[3], paddingBottom: spacing[4] },
});
