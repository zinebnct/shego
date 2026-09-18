import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, sizes } from '@/design-system';
import { IconButton } from '../actions/IconButton';
import { Text } from '../foundation/Text';

export interface NavHeaderProps {
  title: string;
  /** Absent : pas de bouton retour (ex. premier écran). */
  onBack?: () => void;
  trailing?: ReactNode;
}

/** En-tête d'écran de pile : hauteur 56, titre aligné au début (RTL : miroir automatique). */
export function NavHeader({ title, onBack, trailing }: NavHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.base}>
      <View style={styles.side}>
        {onBack ? (
          <IconButton icon="chevronBack" accessibilityLabel={t('common.back')} onPress={onBack} />
        ) : null}
      </View>
      <Text variant="h2" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.side}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.header,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.sable,
  },
  side: { minWidth: sizes.touchTarget, alignItems: 'center' },
  title: { flex: 1 },
});
