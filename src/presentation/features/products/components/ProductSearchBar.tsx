import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Colors, Rounded, Spacing, Typography } from '../../../theme/tokens';

type ProductSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function ProductSearchBar({ value, onChangeText, placeholder }: ProductSearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Buscar productos…'}
        placeholderTextColor={Colors.inkDisabled}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Rounded.md,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  input: {
    color: Colors.inkPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    height: Spacing.touchPreferred,
    paddingHorizontal: Spacing.md,
  },
});
