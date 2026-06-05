import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Elevation, Rounded, Spacing, Typography } from '../theme/tokens';

type FABProps = {
  onPress: () => void;
  accessibilityLabel: string;
  prominent?: boolean;
};

export function FAB({ onPress, accessibilityLabel, prominent = false }: FABProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.button,
        prominent && styles.buttonProminent,
        { bottom: Spacing.md + insets.bottom },
      ]}
    >
      <Text style={[styles.icon, prominent && styles.iconProminent]}>+</Text>
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
  buttonProminent: {
    elevation: Elevation.fab * 2,
    height: 72,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    width: 72,
  },
  icon: {
    color: Colors.onAccentFab,
    fontFamily: Typography.fontFamily,
    fontSize: 28,
    fontWeight: Typography.weightBold,
    lineHeight: 28,
  },
  iconProminent: {
    fontSize: 36,
    lineHeight: 36,
  },
});
