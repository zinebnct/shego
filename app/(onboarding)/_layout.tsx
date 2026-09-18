import { Stack } from 'expo-router';
import { colors } from '@/design-system';

/**
 * Onboarding : pile plein écran, sans tab bar. Le geste retour est désactivé : le CTA est le seul moyen d'avancer,
 * aucun geste ne contourne une étape obligatoire (Onboarding V1.3 §2 point 5). Le retour explicite reste offert
 * par le bouton du gabarit (sauf écran 1).
 */
export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.surface.sable },
      }}
    />
  );
}
