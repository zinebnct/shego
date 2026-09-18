import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { updateProfile } from '@/services/profile.service';
import type { PermissionState } from './useNotificationPermission';

/**
 * Permission de localisation (premier plan uniquement) — hook isolé, jamais demandée en groupe (Blueprint §22).
 * Refus : la Home s'ouvre quand même en mode « ville entière », `location_opt_in = false`.
 * La position n'est JAMAIS stockée ni partagée : elle ne sert qu'à l'appel de découverte.
 */
export function useLocationPermission() {
  const [state, setState] = useState<PermissionState>('undetermined');

  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then((r) => setState(r.status));
  }, []);

  const request = useCallback(async (): Promise<PermissionState> => {
    const result = await Location.requestForegroundPermissionsAsync();
    setState(result.status);
    await updateProfile({ location_opt_in: result.status === 'granted' });
    return result.status;
  }, []);

  return { state, request };
}
