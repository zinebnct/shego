// Imports par graisse : Metro n'embarque que les 5 fichiers de police réellement utilisés (et non les 18 × 2 variantes
// du package). Fraunces = display/marque uniquement ; Plus Jakarta Sans = UI (Design System §4).
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';

/** Polices chargées au démarrage (root layout). Les clés correspondent à `fontFamilies`. */
export const fontAssets = {
  Fraunces_600SemiBold,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
};
