/**
 * Primitives de motion (DS §17) : durées 100-300 ms, easing standard, feedback tactile systématique,
 * `prefers-reduced-motion` respecté (réduction : plus d'animation de mise à l'échelle ni de glissement).
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { motion } from './tokens';

export const standardEasing = Easing.bezier(...motion.easing.standard);

/** Vrai si l'utilisatrice a demandé de réduire les animations. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => active && setReduced(value));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/** Échelle « pressée » (0,98 en 120 ms) pour boutons et cartes tapables. */
export function usePressScale() {
  const reduced = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));

  const animate = (to: number) => {
    if (reduced) return;
    Animated.timing(scale, {
      toValue: to,
      duration: motion.duration.press,
      easing: standardEasing,
      useNativeDriver: true,
    }).start();
  };

  return {
    scale,
    onPressIn: () => animate(motion.pressScale),
    onPressOut: () => animate(1),
  };
}
