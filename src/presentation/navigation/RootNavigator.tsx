import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BranchSelectScreen, LoginScreen, ShiftOpenScreen } from '../features/auth';
import { InitializationGate } from './InitializationGate';
import { useAppStore } from '../store';

function AuthRouter() {
  const activeBranch = useAppStore((state) => state.activeBranch);
  const pendingOperatorName = useAppStore((state) => state.pendingOperatorName);

  if (!activeBranch) {
    return <BranchSelectScreen />;
  }

  if (pendingOperatorName) {
    return <ShiftOpenScreen />;
  }

  return <LoginScreen />;
}

export function RootNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <InitializationGate>
          <AuthRouter />
        </InitializationGate>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
