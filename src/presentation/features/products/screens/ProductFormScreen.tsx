import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Product } from '../../../../domain/entities/Product';
import { DeactivateProductUseCase } from '../../../../application/products/DeactivateProductUseCase';
import { SaveProductUseCase } from '../../../../application/products/SaveProductUseCase';
import { ProductRepository } from '../../../../infrastructure/repositories/ProductRepository';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useAppStore } from '../../../store';
import { Colors, Rounded, Spacing, Typography } from '../../../theme/tokens';
import type { ProductsStackParamList } from '../ProductsNavigator';

type ProductFormRouteProp = RouteProp<ProductsStackParamList, 'ProductForm'>;
type ProductFormNavProp = NativeStackNavigationProp<ProductsStackParamList, 'ProductForm'>;

export function ProductFormScreen() {
  const navigation = useNavigation<ProductFormNavProp>();
  const route = useRoute<ProductFormRouteProp>();
  const productId = route.params?.productId;
  const isAdminMode = useAppStore((s) => s.isAdminMode);

  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [costText, setCostText] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: productId ? 'Editar Producto' : 'Nuevo Producto',
    });
  }, [navigation, productId]);

  useEffect(() => {
    let mounted = true;

    if (!productId) {
      return () => {
        mounted = false;
      };
    }

    const repo = new ProductRepository();
    repo.findById(productId).then((loadedProduct) => {
      if (!mounted || !loadedProduct) {
        return;
      }

      setProduct(loadedProduct);
      setName(loadedProduct.name);
      setPriceText(String(loadedProduct.priceCents / 100));
      setCostText(loadedProduct.costCents != null ? String(loadedProduct.costCents / 100) : '');
    });

    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleDeactivate = async () => {
    if (!productId || isDeactivating) {
      return;
    }
    setIsDeactivating(true);
    try {
      const hasOpen = await new ProductRepository().hasOpenNoteItems(productId);
      const message = hasOpen
        ? '¿Desactivar este producto? Está siendo usado en notas abiertas. Dejará de aparecer en el POS cuando esas notas se cobren o cancelen.'
        : '¿Desactivar este producto? Dejará de aparecer en el POS.';

      Alert.alert('Desactivar producto', message, [
        { text: 'Cancelar', style: 'cancel', onPress: () => setIsDeactivating(false) },
        {
          text: 'Sí, desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await new DeactivateProductUseCase().execute(productId);
              navigation.goBack();
            } catch {
              setIsDeactivating(false);
              Alert.alert('Error', 'No se pudo desactivar el producto. Inténtalo de nuevo.');
            }
          },
        },
      ]);
    } catch {
      setIsDeactivating(false);
      Alert.alert('Error', 'No se pudo verificar el estado del producto. Inténtalo de nuevo.');
    }
  };

  const priceValue = Number.parseFloat(priceText);
  const isValid =
    name.trim().length > 0 &&
    priceText.trim().length > 0 &&
    Number.isFinite(priceValue) &&
    priceValue > 0 &&
    (!costText.trim() || Number.isFinite(Number.parseFloat(costText)));

  const handleSave = async () => {
    if (!isValid || saving) {
      return;
    }

    setSaving(true);
    try {
      const priceCents = Math.round(priceValue * 100);
      const parsedCost = Number.parseFloat(costText);
      const costCents = costText.trim() && Number.isFinite(parsedCost)
        ? Math.round(parsedCost * 100)
        : null;

      await new SaveProductUseCase().execute({
        id: productId,
        name,
        priceCents,
        costCents,
      });

      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el producto. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          autoCapitalize="sentences"
          autoFocus={!productId}
          placeholder="Ej. Lavado de ropa"
          placeholderTextColor={Colors.inkDisabled}
          returnKeyType="next"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Precio de venta (pesos) *</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Ej. 125.00"
          placeholderTextColor={Colors.inkDisabled}
          returnKeyType="next"
          style={styles.input}
          value={priceText}
          onChangeText={setPriceText}
        />

        <Text style={styles.label}>Costo (pesos)</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Opcional"
          placeholderTextColor={Colors.inkDisabled}
          returnKeyType="done"
          style={styles.input}
          value={costText}
          onChangeText={setCostText}
        />

        <PrimaryButton
          label={saving ? 'Guardando…' : 'Guardar'}
          onPress={handleSave}
          disabled={!isValid || saving}
        />

        {isAdminMode && productId && product?.active === true ? (
          <TouchableOpacity
            accessibilityLabel="Desactivar producto"
            accessibilityRole="button"
            disabled={isDeactivating}
            onPress={handleDeactivate}
            style={styles.deactivateButton}
          >
            <Text style={styles.deactivateButtonText}>Desactivar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  form: {
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  label: {
    color: Colors.inkSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeSm,
    fontWeight: Typography.weightMedium,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Rounded.md,
    borderWidth: 1,
    color: Colors.inkPrimary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    height: Spacing.touchPreferred,
    paddingHorizontal: Spacing.md,
  },
  deactivateButton: {
    alignItems: 'center',
    borderColor: Colors.error,
    borderRadius: Rounded.md,
    borderWidth: 1,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  deactivateButtonText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizeBase,
    fontWeight: Typography.weightMedium,
  },
});
