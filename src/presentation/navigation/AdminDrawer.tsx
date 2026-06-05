import { createDrawerNavigator } from '@react-navigation/drawer';
import { HistorialTurnosScreen } from '../features/admin/screens/HistorialTurnosScreen';
import { ProductosAdminScreen } from '../features/admin/screens/ProductosAdminScreen';
import { SucursalesAdminScreen } from '../features/admin/screens/SucursalesAdminScreen';

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
        component={ProductosAdminScreen}
        options={{ title: 'Productos' }}
      />
      <Drawer.Screen
        name="Sucursales"
        component={SucursalesAdminScreen}
        options={{ title: 'Sucursales' }}
      />
    </Drawer.Navigator>
  );
}
