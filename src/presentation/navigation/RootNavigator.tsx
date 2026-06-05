import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LoginScreen } from '../features/auth';
import { InitializationGate } from './InitializationGate';

export function RootNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <InitializationGate>
          <LoginScreen />
        </InitializationGate>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
