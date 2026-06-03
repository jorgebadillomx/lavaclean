import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Rounded, Spacing, Typography } from '../theme/tokens';

type CounterButtonProps = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  accessibilityLabel: string;
};

export function CounterButton({
  value,
  onIncrement,
  onDecrement,
  accessibilityLabel,
}: CounterButtonProps) {
  const currentLabel = `${value} ${accessibilityLabel}`;

  return (
    <View accessibilityLabel={currentLabel} style={styles.container}>
      <Pressable
        accessibilityLabel={`Disminuir ${accessibilityLabel}`}
        accessibilityRole="button"
        onPress={onDecrement}
        style={styles.circleButton}
      >
        <Text style={styles.icon}>−</Text>
      </Pressable>

      <Text style={styles.value}>{value}</Text>

      <Pressable
        accessibilityLabel={`Incrementar ${accessibilityLabel}`}
        accessibilityRole="button"
        onPress={onIncrement}
        style={styles.circleButton}
      >
        <Text style={styles.icon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  circleButton: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: Rounded.full,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  value: {
    color: Colors.inkPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightBold,
    lineHeight: Typography.sizeLg * Typography.lineHeightBase,
    minWidth: 24,
    textAlign: 'center',
  },
  icon: {
    color: Colors.inkPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightBold,
    lineHeight: Typography.sizeLg,
  },
});
