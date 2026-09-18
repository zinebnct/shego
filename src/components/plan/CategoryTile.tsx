import { StyleSheet, View } from 'react-native';
import { categoryTints, radius, sizes } from '@/design-system';
import type { CategoryKey } from '@/types/categories';
import { Icon } from '../foundation/Icon';

/** Tuile de catégorie 44 × 44 (`radius.md`, icône 26) — motif visuel récurrent de SHEGO (Design System §2, §7). */
export function CategoryTile({
  category,
  size = sizes.categoryTile,
}: {
  category: CategoryKey;
  size?: number;
}) {
  return (
    <View
      style={[styles.base, { width: size, height: size, backgroundColor: categoryTints[category] }]}
    >
      {/* Icône générique en attendant les 12 glyphes de catégorie (assets design) — voir components/foundation/Icon.tsx. */}
      <Icon name="dots" size={26} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
