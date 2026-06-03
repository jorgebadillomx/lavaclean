import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Elevation, Rounded, Spacing, Typography } from '../theme/tokens';
import { ConnectivityBadge } from './ConnectivityBadge';

type AppHeaderProps = {
  title?: string;
  onMenuPress: () => void;
};

export function AppHeader({ title, onMenuPress }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftCluster}>
        <Pressable
          accessibilityLabel="Abrir menú"
          accessibilityRole="button"
          accessibilityState={{}}
          onPress={onMenuPress}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <View style={styles.brand}>
          <Text style={styles.waveIcon}>∿</Text>
          <Text style={styles.brandText}>LavaClean</Text>
        </View>
      </View>

      <View style={styles.rightCluster}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <ConnectivityBadge />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    elevation: Elevation.header,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  leftCluster: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 0,
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: Rounded.md,
    height: 56,
    justifyContent: 'center',
    marginLeft: -Spacing.xs,
    width: 56,
  },
  menuIcon: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: 24,
    fontWeight: Typography.weightBold,
    lineHeight: 24,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  waveIcon: {
    color: Colors.brandTeal,
    fontFamily: Typography.fontFamily,
    fontSize: 18,
    fontWeight: Typography.weightBold,
    lineHeight: 18,
  },
  brandText: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightBold,
  },
  rightCluster: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  title: {
    color: Colors.onPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeSm,
    fontWeight: Typography.weightMedium,
    opacity: 0.88,
  },
});
