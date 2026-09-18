import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/design-system';
import { Text } from '../foundation/Text';

/** Plafond du badge numérique : jamais « 99+ », jamais un compteur qui ne se vide pas (Design System §22). */
export const formatBadgeCount = (count: number): string => (count > 9 ? '9+' : String(count));

/** Point (activité non lue) ou compteur (demandes en attente uniquement), plafonné à « 9+ ». */
export function TabBadge({ count, dot = false }: { count?: number; dot?: boolean }) {
  if (dot) return <View style={styles.dot} testID="tab-badge-dot" />;
  if (!count || count <= 0) return null;
  return (
    <View style={styles.count} testID="tab-badge-count">
      <Text variant="tab" tone="onPrimary">
        {formatBadgeCount(count)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: 0,
    end: '28%',
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.brand.grenat,
  },
  count: {
    position: 'absolute',
    top: -2,
    end: '20%',
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand.grenat,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
