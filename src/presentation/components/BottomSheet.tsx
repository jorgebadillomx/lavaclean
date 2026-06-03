import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Colors, Rounded, Spacing } from '../theme/tokens';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(visible);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const visibleRef = useRef(visible);

  // Keep ref in sync so animation callbacks read the latest value
  useEffect(() => {
    visibleRef.current = visible;
  });

  // Resolve reduce-motion preference once on mount
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    return () => {
      active = false;
    };
  }, []);

  // Control mounting — only set mounted=true here; unmounting is driven by the animation callback
  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  // Drive animations — only after the component is mounted AND reduce-motion preference is known
  useEffect(() => {
    if (!mounted || reduceMotion === null) return;

    const screenHeight = Dimensions.get('window').height;

    if (visibleRef.current) {
      if (reduceMotion) {
        translateY.setValue(0);
        overlayOpacity.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      if (reduceMotion) {
        translateY.setValue(screenHeight);
        overlayOpacity.setValue(0);
        setMounted(false);
        return;
      }
      Animated.parallel([
        Animated.timing(translateY, { toValue: screenHeight, duration: 180, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        // Use ref so rapid visible toggles never leave the sheet stuck open
        if (!visibleRef.current) {
          setMounted(false);
        }
      });
    }
  }, [mounted, visible, reduceMotion, overlayOpacity, translateY]);

  if (!mounted) {
    return null;
  }

  const maxHeight = Dimensions.get('window').height * 0.8;

  return (
    <Modal
      transparent
      animationType="none"
      onRequestClose={onClose}
      visible={mounted}
    >
      <View style={styles.root}>
        <AnimatedPressable onPress={onClose} style={[styles.overlay, { opacity: overlayOpacity }]} />
        <Animated.View
          accessibilityViewIsModal
          style={[styles.sheet, { maxHeight, transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: Colors.scrim,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Rounded.xl,
    borderTopRightRadius: Rounded.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: Colors.border,
    borderRadius: Rounded.xs,
    height: 4,
    marginBottom: Spacing.sm,
    width: 32,
  },
});
