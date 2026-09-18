import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/design-system';
import { Screen } from './Screen';
import { Text } from './Text';

/** Écran technique provisoire (bootstrap) : titre + mention de construction. Remplacé par l'écran fonctionnel. */
export function TabPlaceholder({ title, children }: { title: string; children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.body}>
        <Text variant="h1" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" tone="tertiary">
          {t('dev.placeholder')}
        </Text>
        {children}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { flex: 1, paddingTop: spacing[6], gap: spacing[3] } });
