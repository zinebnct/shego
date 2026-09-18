import { initI18n } from '@/i18n';

// Variables d'environnement de test : jamais de vrai projet Supabase dans les tests unitaires.
process.env.EXPO_PUBLIC_APP_ENV = 'development';
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock(
  'react-native-safe-area-context',
  () =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('@react-native-community/netinfo', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

initI18n('fr');

// Bruit connu d'expo-notifications sous Jest (environnement « Expo Go » simulé) : sans intérêt pour les tests.
const originalWarn = console.warn;
jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].startsWith('expo-notifications: Android Push notifications')
  )
    return;
  originalWarn(...args);
});
