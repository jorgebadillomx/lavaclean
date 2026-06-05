import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CerrarTurnoScreen } from '../features/admin/screens/CerrarTurnoScreen';
import { ProductListScreen } from '../features/products';
import { ConnectivityBadge } from '../components/ConnectivityBadge';

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
        component={ProductListScreen}
        options={{ title: 'Productos', headerRight: () => <ConnectivityBadge /> }}
      />
      {/* SIN opciones admin aquí — AC-ADMIN-03 */}
    </Drawer.Navigator>
  );
}
