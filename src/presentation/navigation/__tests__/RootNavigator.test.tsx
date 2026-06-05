/* eslint-disable import/first */
jest.mock('../../features/auth', () => ({
  LoginScreen: () => <MockText testID="login-screen">Login</MockText>,
  BranchSelectScreen: () => <MockText testID="branch-select-screen">Branch</MockText>,
  ShiftOpenScreen: () => <MockText testID="shift-open-screen">ShiftOpen</MockText>,
}));
jest.mock('../InitializationGate', () => ({
  InitializationGate: ({ children }: { children: any }) => children,
}));

import { render } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';
import { useAppStore } from '../../store';
import { RootNavigator } from '../RootNavigator';

describe('RootNavigator', () => {
  beforeEach(() => {
    useAppStore.setState({
      initializationStatus: 'READY',
      initializationError: null,
      activeBranch: null,
      activeShift: null,
      products: [],
      pendingOperatorName: null,
    } as never);
  });

  it('muestra BranchSelectScreen cuando no hay sucursal activa', () => {
    const { getByTestId } = render(<RootNavigator />);

    expect(getByTestId('branch-select-screen')).toBeTruthy();
  });

  it('muestra LoginScreen cuando ya existe una sucursal activa', () => {
    useAppStore.setState({ activeBranch: 'branch-1' } as never);

    const { getByTestId } = render(<RootNavigator />);

    expect(getByTestId('login-screen')).toBeTruthy();
  });

  it('muestra ShiftOpenScreen cuando hay pendingOperatorName seteado', () => {
    useAppStore.setState({ activeBranch: 'branch-1', pendingOperatorName: 'María' } as never);

    const { getByTestId } = render(<RootNavigator />);

    expect(getByTestId('shift-open-screen')).toBeTruthy();
  });
});
