import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** Bannière « Pas de connexion » pilotée par NetInfo, jamais par l'échec d'une requête isolée (Blueprint §24). */
export function useNetworkStatus(): { isOffline: boolean } {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return unsubscribe;
  }, []);
  return { isOffline };
}
