import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Product } from '../../../../domain/entities/Product';
import { ReorderProductsUseCase } from '../../../../application/products/ReorderProductsUseCase';
import { ProductRepository } from '../../../../infrastructure/repositories/ProductRepository';
import { useAppStore } from '../../../store';
import { Colors, Spacing, Typography } from '../../../theme/tokens';
import { EmptyState } from '../../../components/EmptyState';
import { FAB } from '../../../components/FAB';
import { formatCurrency } from '../../../utils/format';
import { ProductReorderRow } from '../components/ProductReorderRow';
import { ProductSearchBar } from '../components/ProductSearchBar';
import type { ProductsStackParamList } from '../ProductsNavigator';

export function ProductListScreen() {
  const activeBranch = useAppStore((s) => s.activeBranch);
  const navigation = useNavigation<NativeStackNavigationProp<ProductsStackParamList, 'ProductList'>>();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      new ProductRepository()
        .findAllActive(activeBranch)
        .then((data) => {
          if (mounted) {
            setProducts(data);
          }
        })
        .catch(() => {
          if (mounted) {
            setProducts([]);
          }
        });

      return () => {
        mounted = false;
      };
    }, [activeBranch]),
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const handleMove = useCallback(
    async (productId: string, direction: 'up' | 'down') => {
      if (isReordering || !activeBranch) {
        return;
      }

      setIsReordering(true);
      try {
        const newOrder = await new ReorderProductsUseCase().execute(
          activeBranch,
          filtered,
          productId,
          direction,
        );
        setProducts(newOrder);
      } catch {
        // Mantener el orden actual en pantalla si falla la persistencia local.
      } finally {
        setIsReordering(false);
      }
    },
    [activeBranch, isReordering, filtered],
  );

  const isEmpty = filtered.length === 0 && query.trim() === '';

  return (
    <View style={styles.container}>
      <ProductSearchBar value={query} onChangeText={setQuery} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          query.trim() === '' ? (
            <ProductReorderRow
              product={item}
              isFirst={index === 0}
              isLast={index === filtered.length - 1}
              onMoveUp={() => handleMove(item.id, 'up')}
              onMoveDown={() => handleMove(item.id, 'down')}
              onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
            />
          ) : (
            <Pressable
              accessibilityLabel={item.name}
              accessibilityRole="button"
              onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
              style={styles.row}
            >
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
              </Text>
              <View style={styles.prices}>
                <Text style={styles.price}>{formatCurrency(item.priceCents)}</Text>
                {item.costCents != null ? (
                  <Text style={styles.cost}>Costo: {formatCurrency(item.costCents)}</Text>
                ) : (
                  <Text style={styles.cost}>Costo: —</Text>
                )}
              </View>
            </Pressable>
          )
        )}
        ListEmptyComponent={
          query.trim() === ''
            ? <EmptyState variant="PRODUCTS" />
            : (
              <Text style={styles.noResults}>
                Sin resultados para {"\""}
                {query}
                {"\""}
              </Text>
            )
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : undefined}
      />
      <FAB
        accessibilityLabel="Agregar producto"
        onPress={() => navigation.navigate('ProductForm', {})}
        prominent={isEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  row: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: Spacing.touchPreferred,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  name: {
    color: Colors.inkPrimary,
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    fontWeight: Typography.weightMedium,
  },
  prices: {
    alignItems: 'flex-end',
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
  noResults: {
    color: Colors.inkSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    padding: Spacing.lg,
    textAlign: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
