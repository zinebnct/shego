import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, motion, radius, spacing, standardEasing, useReducedMotion } from '@/design-system';
import { IconButton } from '../actions/IconButton';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Libellé accessible de la croix de fermeture (i18n). */
  closeLabel: string;
  testID?: string;
}

/**
 * Bottom sheet (Design System §2 : rayon 28 en haut uniquement, une seule couche d'overlay à la fois).
 * Glissement 240 ms, `easing.standard` ; sans animation si l'utilisatrice réduit les animations.
 */
export function BottomSheet({ visible, onClose, children, closeLabel, testID }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [translateY] = useState(() => new Animated.Value(height));

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      translateY.setValue(0);
      return;
    }
    translateY.setValue(height);
    Animated.timing(translateY, {
      toValue: 0,
      duration: motion.duration.slide,
      easing: standardEasing,
      useNativeDriver: true,
    }).start();
  }, [visible, reduced, height, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root} testID={testID}>
        <Pressable
          style={styles.overlay}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing[5]), transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.closeRow}>
            <IconButton icon="close" accessibilityLabel={closeLabel} onPress={onClose} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.surface.overlay },
  sheet: {
    backgroundColor: colors.surface.surface,
    borderTopStartRadius: radius['2xl'],
    borderTopEndRadius: radius['2xl'],
    paddingHorizontal: spacing[5],
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.strong,
    marginTop: spacing[2],
  },
  closeRow: { alignItems: 'flex-end', marginBottom: spacing[1] },
});
