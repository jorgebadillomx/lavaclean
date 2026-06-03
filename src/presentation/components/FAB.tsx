import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Elevation, Rounded, Spacing, Typography } from '../theme/tokens';

type FABProps = {
  onPress: () => void;
  accessibilityLabel: string;
};

export function FAB({ onPress, accessibilityLabel }: FABProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, { bottom: Spacing.md + insets.bottom }]}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.accentFab,
    borderRadius: Rounded.full,
    elevation: Elevation.fab,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 56,
  },
  icon: {
    color: Colors.onAccentFab,
    fontFamily: Typography.fontFamily,
    fontSize: 28,
    fontWeight: Typography.weightBold,
    lineHeight: 28,
  },
});
