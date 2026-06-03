import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Rounded, Spacing, Typography } from '../theme/tokens';

type DrawerItemProps = {
  label: string;
  icon?: ReactNode;
  isActive?: boolean;
  onPress: () => void;
};

export function DrawerItem({ label, icon, isActive = false, onPress }: DrawerItemProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={[styles.container, isActive ? styles.active : styles.inactive]}
    >
      <View style={styles.icon}>{icon}</View>
      <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Spacing.touchPreferred,
    paddingHorizontal: Spacing.md,
  },
  active: {
    backgroundColor: Colors.primaryContainer,
  },
  inactive: {
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    minWidth: 24,
  },
  label: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    fontWeight: Typography.weightMedium,
  },
  activeLabel: {
    color: Colors.onPrimaryContainer,
  },
  inactiveLabel: {
    color: Colors.inkPrimary,
  },
});
