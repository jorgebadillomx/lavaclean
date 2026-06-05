import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HistorialTurnosScreen } from '../features/admin/screens/HistorialTurnosScreen';
import { ProductListScreen } from '../features/products';
import { SucursalesAdminScreen } from '../features/admin/screens/SucursalesAdminScreen';
import { ConnectivityBadge } from '../components/ConnectivityBadge';

type AdminDrawerParamList = {
  HistorialTurnos: undefined;
  Productos: undefined;
  Sucursales: undefined;
};

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

export function AdminDrawer() {
  return (
    <Drawer.Navigator initialRouteName="HistorialTurnos">
      <Drawer.Screen
        name="HistorialTurnos"
        component={HistorialTurnosScreen}
        options={{ title: 'Historial de Turnos' }}
      />
      <Drawer.Screen
        name="Productos"
        component={ProductListScreen}
        options={{ title: 'Productos', headerRight: () => <ConnectivityBadge /> }}
      />
      <Drawer.Screen
        name="Sucursales"
        component={SucursalesAdminScreen}
        options={{ title: 'Sucursales' }}
      />
    </Drawer.Navigator>
  );
}
