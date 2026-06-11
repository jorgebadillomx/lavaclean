import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Product } from '../../../../domain/entities/Product';
import { formatCurrency } from '../../../utils/format';
import { Colors, Spacing, Typography } from '../../../theme/tokens';

interface ProductReorderRowProps {
  product: Product;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPress: () => void;
}

export function ProductReorderRow({
  product,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onPress,
}: ProductReorderRowProps) {
  return (
    <Pressable
      accessibilityLabel={product.name}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {product.name}
        </Text>
        <View style={styles.prices}>
          <Text style={styles.price}>{formatCurrency(product.priceCents)}</Text>
          {product.costCents != null ? (
            <Text style={styles.cost}>Costo: {formatCurrency(product.costCents)}</Text>
          ) : (
            <Text style={styles.cost}>Costo: —</Text>
          )}
        </View>
      </View>
      <View style={styles.reorderButtons}>
        <TouchableOpacity
          accessibilityLabel={`Mover ${product.name} arriba`}
          accessibilityRole="button"
          disabled={isFirst}
          onPress={onMoveUp}
          style={[styles.reorderBtn, isFirst && styles.hidden]}
        >
          <Text style={styles.reorderBtnText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={`Mover ${product.name} abajo`}
          accessibilityRole="button"
          disabled={isLast}
          onPress={onMoveDown}
          style={[styles.reorderBtn, isLast && styles.hidden]}
        >
          <Text style={styles.reorderBtnText}>↓</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: Spacing.touchPreferred,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    color: Colors.inkPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    fontWeight: Typography.weightMedium,
  },
  prices: {
    alignItems: 'flex-start',
  },
  price: {
    color: Colors.inkPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    fontWeight: Typography.weightBold,
  },
  cost: {
    color: Colors.inkSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeSm,
    fontWeight: Typography.weightRegular,
  },
  reorderButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  reorderBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Spacing.touchMin,
    minWidth: Spacing.touchMin,
  },
  reorderBtnText: {
    color: Colors.inkSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightMedium,
  },
  hidden: {
    opacity: 0,
  },
});
