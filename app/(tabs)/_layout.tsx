import { Tabs } from 'expo-router';
import { TabBar } from '@/components/navigation/TabBar';

/**
 * Navigation basse (Design System §11, Blueprint §19) : 4 routes — Accueil, Mes plans, Messages, Profil — plus le
 * bouton central « Créer » rendu par `TabBar` (élément structurel, pas une route : Create Plan est un modal hors Tabs).
 * Badges : `mes-plans` = demandes en attente (numérique, plafonné à « 9+ »), `messages` = point d'activité non lue.
 */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="mes-plans" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
