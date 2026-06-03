import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '../theme/tokens';

export type TabBarTab = {
  key: string;
  label: string;
};

type TabBarProps = {
  tabs: TabBarTab[];
  activeKey: string;
  onTabPress: (key: string) => void;
};

export function TabBar({ tabs, activeKey, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;

        return (
          <Pressable
            key={tab.key}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onTabPress(tab.key)}
            style={styles.tab}
          >
            <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
              {tab.label?.toUpperCase() ?? ''}
            </Text>
            <View style={[styles.indicator, active ? styles.activeIndicator : styles.hiddenIndicator]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeSm,
    fontWeight: Typography.weightMedium,
    letterSpacing: 0.4,
  },
  activeLabel: {
    color: Colors.primary,
  },
  inactiveLabel: {
    color: Colors.inkSecondary,
  },
  indicator: {
    borderRadius: 1,
    height: 2,
    marginTop: Spacing.xs,
    width: '100%',
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
  },
  hiddenIndicator: {
    backgroundColor: 'transparent',
  },
});
