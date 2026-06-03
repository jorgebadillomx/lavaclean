import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { Colors, Rounded, Spacing, Typography } from '../theme/tokens';

export function ConnectivityBadge() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    NetInfo.fetch()
      .then((state) => {
        if (mounted) setIsOnline(state.isConnected ?? false);
      })
      .catch(() => {
        if (mounted) setIsOnline(false);
      });

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (mounted) setIsOnline(state.isConnected ?? false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (isOnline !== false) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      <Text style={styles.icon}>↯</Text>
      <Text style={styles.label}>Sin conexión</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.warningBg,
    borderRadius: Rounded.lg,
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  label: {
    color: Colors.warning,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeSm,
    fontWeight: Typography.weightMedium,
  },
  icon: {
    color: Colors.warning,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    fontWeight: Typography.weightBold,
    lineHeight: Typography.sizeBase,
  },
});
