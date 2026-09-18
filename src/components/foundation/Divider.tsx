import { View } from 'react-native';
import { colors } from '@/design-system';

export function Divider() {
  return (
    <View style={{ height: 1, backgroundColor: colors.border.default }} accessibilityRole="none" />
  );
}
