import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { colors, radius, shadows, sizes } from '@/design-system';
import { useAccountGate } from '@/hooks/useAccountGate';
import { Icon, type IconName } from '../foundation/Icon';
import { Text } from '../foundation/Text';
import { TabBadge } from './TabBadge';

/** Onglets (Design System §11) : 4 libellés + bouton central « Créer » (structurel, hors des routes). */
const TABS: Record<
  string,
  { icon: IconName; labelKey: 'tabs.home' | 'tabs.myPlans' | 'tabs.messages' | 'tabs.profile' }
> = {
  home: { icon: 'home', labelKey: 'tabs.home' },
  'mes-plans': { icon: 'calendar', labelKey: 'tabs.myPlans' },
  messages: { icon: 'chat', labelKey: 'tabs.messages' },
  profil: { icon: 'user', labelKey: 'tabs.profile' },
};

/**
 * Barre de navigation basse : Accueil · Mes plans · [+ Créer] · Messages · Profil.
 * Le bouton central (56, Grenat, remonté de 12 px) est l'UNIQUE affordance de création de la V1 — il reste visible
 * et identique dans tous les états du compte ; seule son ACTION varie (via `useAccountGate` : création, « ce qui
 * manque », ou feuille `under_review`). Aucun FAB n'existe ailleurs.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { requireReady } = useAccountGate();

  const items = state.routes.filter((route) => route.name in TABS);
  const createButton = (
    <View key="create" style={styles.slot}>
      <Pressable
        testID="tab-create"
        accessibilityRole="button"
        accessibilityLabel={t('tabs.create')}
        onPress={() => requireReady(() => router.push('/create-plan' as Href))}
        style={({ pressed }) => [styles.create, pressed && styles.createPressed]}
      >
        <Icon name="plus" size="lg" color={colors.text.surGrenat} />
      </Pressable>
    </View>
  );

  const slots = items.map((route) => {
    const tab = TABS[route.name];
    const descriptor = descriptors[route.key];
    if (!tab || !descriptor) return null;
    const focused = state.routes[state.index]?.key === route.key;
    const badge = descriptor.options.tabBarBadge;
    const color = focused ? colors.brand.grenat : colors.text.encre70;

    return (
      <Pressable
        key={route.key}
        testID={`tab-${route.name}`}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={t(tab.labelKey)}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }}
        style={styles.slot}
      >
        <Icon name={tab.icon} color={color} filled={focused && route.name === 'home'} />
        <Text variant="tab" style={{ color }}>
          {t(tab.labelKey)}
        </Text>
        {typeof badge === 'number' ? (
          <TabBadge count={badge} />
        ) : badge === '•' ? (
          <TabBadge dot />
        ) : null}
      </Pressable>
    );
  });

  // Insère le bouton Créer au milieu (slot 3 sur 5).
  const ordered = [...slots.slice(0, 2), createButton, ...slots.slice(2)];

  return (
    <View
      style={[styles.bar, { height: sizes.tabBar + insets.bottom, paddingBottom: insets.bottom }]}
    >
      {ordered}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  create: {
    width: sizes.createButton,
    height: sizes.createButton,
    borderRadius: radius.full, // rond par nature
    transform: [{ translateY: -sizes.createButtonLift }],
    backgroundColor: colors.brand.grenat,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevation2,
  },
  createPressed: { backgroundColor: colors.brand.grenat700 },
});
