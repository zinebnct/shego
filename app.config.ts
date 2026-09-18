import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuration Expo dynamique — un binaire distinct par environnement (development / staging / production).
 * `EXPO_PUBLIC_APP_ENV` est fourni par le profil EAS (eas.json) ou par `.env.local` en local.
 *
 * Identifiants d'application : PLACEHOLDER `com.shego.app` — à confirmer avant le premier `eas build`
 * (ils doivent correspondre à ceux déclarés chez Apple, Google et dans supabase/config.toml).
 */
type AppEnv = 'development' | 'staging' | 'production';

const APP_ENV: AppEnv =
  process.env.EXPO_PUBLIC_APP_ENV === 'staging' || process.env.EXPO_PUBLIC_APP_ENV === 'production'
    ? process.env.EXPO_PUBLIC_APP_ENV
    : 'development';

const BASE_ID = 'com.shego.app';
const ID_SUFFIX: Record<AppEnv, string> = {
  development: '.dev',
  staging: '.staging',
  production: '',
};
const NAME_SUFFIX: Record<AppEnv, string> = {
  development: ' (Dev)',
  staging: ' (Staging)',
  production: '',
};

// Sable — fond principal du Design System V1.3 §3.
const SABLE = '#FBF7F2';
const GRENAT = '#6B2A4F';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `SHEGO${NAME_SUFFIX[APP_ENV]}`,
  slug: 'shego',
  scheme: 'shego',
  version: '0.1.0',
  orientation: 'portrait',
  platforms: ['ios', 'android'], // mobile uniquement
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light', // mode sombre : LATER (Design System §3)
  backgroundColor: SABLE,
  ios: {
    bundleIdentifier: `${BASE_ID}${ID_SUFFIX[APP_ENV]}`,
    supportsTablet: false,
    usesAppleSignIn: true, // Sign in with Apple (natif iOS) — Blueprint §10
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: `${BASE_ID}${ID_SUFFIX[APP_ENV]}`,
    adaptiveIcon: {
      backgroundColor: SABLE,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      { backgroundColor: SABLE, image: './assets/images/splash-icon.png', imageWidth: 76 },
    ],
    'expo-font',
    'expo-web-browser', // flow OAuth Apple sur Android (Blueprint §10)
    'expo-apple-authentication',
    'expo-secure-store',
    ['expo-localization', { supportedLocales: { ios: ['fr'], android: ['fr'] } }], // V1 : français uniquement
    ['expo-notifications', { color: GRENAT }],
    [
      'expo-location',
      {
        // Foreground uniquement : la position sert à afficher des plans proches et n'est jamais stockée ni partagée.
        locationWhenInUsePermission:
          "SHEGO utilise ta position pour afficher les plans autour de toi. Elle n'est jamais montrée aux autres personnes.",
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: 'SHEGO utilise la caméra pour prendre ta photo de profil.',
        photosPermission: 'SHEGO accède à tes photos pour que tu choisisses ta photo de profil.',
        microphonePermission: false,
      },
    ],
    // Sign in with Google (SDK natif) — le schéma d'URL iOS dépend du client Google de l'environnement.
    ...(process.env.GOOGLE_IOS_URL_SCHEME
      ? [
          [
            '@react-native-google-signin/google-signin',
            { iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME },
          ] as [string, Record<string, unknown>],
        ]
      : []),
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: { appEnv: APP_ENV },
});
