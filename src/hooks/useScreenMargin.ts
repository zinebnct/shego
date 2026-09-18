import { useWindowDimensions } from 'react-native';
import { layout } from '@/design-system';

/** Marge latérale d'écran : 20, ou 16 sur les écrans ≤ 360 pt (Home §7, Onboarding §11). */
export function useScreenMargin(): number {
  const { width } = useWindowDimensions();
  return width <= layout.compactWidth ? layout.screenMarginCompact : layout.screenMargin;
}
