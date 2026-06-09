import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SaveProductUseCase } from '../../../../application/products/SaveProductUseCase';
import { ProductRepository } from '../../../../infrastructure/repositories/ProductRepository';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Colors, Rounded, Spacing, Typography } from '../../../theme/tokens';
import type { ProductsStackParamList } from '../ProductsNavigator';

type ProductFormRouteProp = RouteProp<ProductsStackParamList, 'ProductForm'>;
type ProductFormNavProp = NativeStackNavigationProp<ProductsStackParamList, 'ProductForm'>;

export function ProductFormScreen() {
  const navigation = useNavigation<ProductFormNavProp>();
  const route = useRoute<ProductFormRouteProp>();
  const productId = route.params?.productId;

  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [costText, setCostText] = useState('');
  const [saving, setSaving] = useState(false);

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
    repo.findById(productId).then((product) => {
      if (!mounted || !product) {
        return;
      }

      setName(product.name);
      setPriceText(String(product.priceCents / 100));
      setCostText(product.costCents != null ? String(product.costCents / 100) : '');
    });

    return () => {
      mounted = false;
    };
  }, [productId]);

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
});
