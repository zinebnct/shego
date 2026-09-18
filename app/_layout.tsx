import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { colors } from '@/design-system';
import { fontAssets } from '@/design-system/fonts';
import { AccountGateProvider } from '@/hooks/useAccountGate';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { applyLayoutDirection, initI18n } from '@/i18n';
import { configureNotificationHandler } from '@/services/notifications.service';

void SplashScreen.preventAutoHideAsync();
initI18n(); // français uniquement en V1 ; architecture ar/en/RTL prête (src/i18n/locales.ts)
applyLayoutDirection('fr');
configureNotificationHandler();

// Cache léger Home / Mes plans (Blueprint §24). Le réseau est piloté par NetInfo, pas par l'échec d'une requête.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function Navigator() {
  const authReady = useAuthBootstrap();
  const [fontsLoaded] = useFonts(fontAssets);
  const ready = authReady && fontsLoaded;

  useProtectedRoute(ready);
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.sable },
      }}
    >
      <Stack.Screen name="(onboarding)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="plan" />
      {/* Create Plan : modal plein écran depuis le bouton central, hors de la pile Tabs (Blueprint §3). */}
      <Stack.Screen name="create-plan" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settings" />
      <Stack.Screen name="account-restricted" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AccountGateProvider>
            <StatusBar style="dark" />
            <Navigator />
          </AccountGateProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.surface.sable } });
