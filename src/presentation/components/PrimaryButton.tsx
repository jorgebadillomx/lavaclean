import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Rounded, Spacing, Typography } from '../theme/tokens';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.inkDisabled : Colors.primary,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: Rounded.md,
    height: Spacing.touchPreferred,
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightBold,
    lineHeight: Typography.sizeLg * Typography.lineHeightBase,
  },
});
