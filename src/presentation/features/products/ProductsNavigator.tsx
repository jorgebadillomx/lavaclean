import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConnectivityBadge } from '../../components/ConnectivityBadge';
import { ProductListScreen } from './screens/ProductListScreen';
import { ProductFormScreen } from './screens/ProductFormScreen';

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductForm: { productId?: string };
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export function ProductsNavigator() {
  return (
    <Stack.Navigator initialRouteName="ProductList">
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          title: 'Productos',
          headerRight: () => <ConnectivityBadge />,
        }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}
