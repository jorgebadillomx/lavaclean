import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InitializationGate } from './InitializationGate';

export function RootNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <InitializationGate>
          {null /* DrawerNavigator se agrega en Story 2.x */}
        </InitializationGate>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
