import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  Rounded,
  Spacing,
  Typography,
} from '../theme/tokens';
import { EMPTY_STATE_REGISTRY, EmptyStateVariant } from './emptyStateRegistry';

type EmptyStateBase = {
  variant?: EmptyStateVariant;
  text?: string;
  icon?: ReactNode;
};

type WithAction = EmptyStateBase & { actionLabel: string; onAction: () => void };
type WithoutAction = EmptyStateBase & { actionLabel?: undefined; onAction?: never };

type EmptyStateProps = WithAction | WithoutAction;

export function EmptyState({
  variant,
  text,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const registry = variant ? EMPTY_STATE_REGISTRY[variant] : undefined;
  const resolvedText = text ?? registry?.text ?? '';
  const resolvedActionLabel = actionLabel ?? registry?.actionLabel;

  return (
    <View style={styles.container}>
      <View style={styles.icon}>{icon ?? <Text style={styles.iconGlyph}>□</Text>}</View>
      <Text style={styles.text}>{resolvedText}</Text>
      {resolvedActionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={resolvedActionLabel}
          onPress={onAction}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>{resolvedActionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  iconGlyph: {
    color: Colors.inkSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: 32,
    fontWeight: Typography.weightRegular,
    lineHeight: 32,
  },
  text: {
    color: Colors.inkSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    fontWeight: Typography.weightRegular,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Rounded.md,
    height: Spacing.touchPreferred,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  buttonLabel: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightBold,
  },
});
