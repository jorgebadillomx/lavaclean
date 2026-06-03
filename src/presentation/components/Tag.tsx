import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Rounded, Spacing, Typography } from '../theme/tokens';

type TagProps = {
  label: string;
  backgroundColor: string;
  inkColor: string;
};

export function Tag({ label, backgroundColor, inkColor }: TagProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.label, { color: inkColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: Rounded.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeXs,
    fontWeight: Typography.weightMedium,
    lineHeight: Typography.sizeXs * Typography.lineHeightBase,
  },
});
