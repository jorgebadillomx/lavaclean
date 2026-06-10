import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CerrarTurnoScreen } from '../features/admin/screens/CerrarTurnoScreen';
import { ProductsNavigator } from '../features/products';

type OperatorDrawerParamList = {
  CerrarTurno: undefined;
  Productos: undefined;
};

const Drawer = createDrawerNavigator<OperatorDrawerParamList>();

export function OperatorDrawer() {
  return (
    <Drawer.Navigator initialRouteName="CerrarTurno">
      <Drawer.Screen
        name="CerrarTurno"
        component={CerrarTurnoScreen}
        options={{ title: 'Cerrar Turno' }}
      />
      <Drawer.Screen
        name="Productos"
        component={ProductsNavigator}
        options={{ title: 'Productos', headerShown: false }}
      />
      {/* SIN opciones admin aquí — AC-ADMIN-03 */}
    </Drawer.Navigator>
  );
}
