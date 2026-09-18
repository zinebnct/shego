/**
 * Signal `device_id` — technique, NON biométrique, volontairement minimal (Technical Blueprint V1.3 §39).
 * Identifiant déjà fourni par l'OS pour l'app : `identifierForVendor` (iOS) / identifiant d'installation (Android).
 * Aucun fingerprinting, aucun identifiant publicitaire, aucune liste d'applications.
 */
import { Platform } from 'react-native';
import * as Application from 'expo-application';

export async function getDeviceId(): Promise<string | null> {
  try {
    if (Platform.OS === 'ios') return await Application.getIosIdForVendorAsync();
    if (Platform.OS === 'android') return Application.getAndroidId();
  } catch {
    // Signal facultatif : son absence ne bloque jamais l'onboarding.
  }
  return null;
}
