import { Stack } from 'expo-router';
import { colors } from '@/design-system';

/** Plan Detail (`plan/[id]`) puis Plan Chat (`plan/[id]/chat`) : piles poussées depuis Home/Carte/Mes plans/notification. */
export default function PlanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.sable },
      }}
    />
  );
}
