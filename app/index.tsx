import { View } from 'react-native';
import { colors } from '@/design-system';

/** Point d'entrée « / » : la redirection (onboarding, reprise, Home, compte restreint) est faite par `useProtectedRoute`. */
export default function Index() {
  return <View style={{ flex: 1, backgroundColor: colors.surface.sable }} />;
}
