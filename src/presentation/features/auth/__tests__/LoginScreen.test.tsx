import { render, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LoginScreen } from '../LoginScreen';
import { useAppStore } from '../../../store';

jest.mock('../../../../infrastructure/printing/RawBTPrinterAdapter', () => ({
  fireRawBTTestIntent: jest.fn(),
  RAWBT_SPIKE_TEST_TEXT: 'TEST',
}));

// mockVerify is assigned inside the factory body (runs before new AdminAuthService() in LoginScreen.tsx),
// not in a closure that evaluates at constructor call time.  This avoids the TDZ hazard that arises when
// a const/let initialiser runs after require('../LoginScreen') in Babel-transformed output.
let mockVerify: jest.Mock;
jest.mock('../../../../infrastructure/auth/AdminAuthService', () => {
  mockVerify = jest.fn().mockResolvedValue(false);
  return {
    AdminAuthService: jest.fn().mockImplementation(() => ({
      verify: mockVerify,
    })),
  };
});

jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: { adminSalt: 'test-salt' } } },
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    mockVerify.mockReset();
    mockVerify.mockResolvedValue(false);
    useAppStore.setState({
      activeShift: null,
      pendingOperatorName: null,
      isAdminMode: false,
    } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el logo y formulario de login sin turno activo', () => {
    render(<LoginScreen />);
    expect(screen.getByText('LavaClean')).toBeTruthy();
    expect(screen.getByLabelText('Entrar')).toBeTruthy();
  });

  it('botón Entrar deshabilitado cuando el nombre está vacío', () => {
    render(<LoginScreen />);
    expect(screen.getByLabelText('Entrar')).toBeDisabled();
  });

  it('botón Entrar habilitado cuando hay nombre', async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);
    await user.type(screen.getByLabelText('Campo de nombre'), 'María');
    expect(screen.getByLabelText('Entrar')).toBeEnabled();
  });

  it('muestra mensaje bloqueante cuando hay turno activo', () => {
    useAppStore.setState({
      activeShift: { id: 'shift-1', operator_name: 'Juan', branch_id: 'b-1', status: 'open' },
    } as never);
    render(<LoginScreen />);
    expect(screen.getByText('Esta sucursal ya tiene un turno activo.')).toBeTruthy();
    expect(screen.queryByLabelText('Entrar')).toBeNull();
  });

  it('no muestra campo de nombre cuando hay turno activo', () => {
    useAppStore.setState({
      activeShift: { id: 'shift-1', operator_name: 'Juan', status: 'open' },
    } as never);
    render(<LoginScreen />);
    expect(screen.queryByLabelText('Campo de nombre')).toBeNull();
  });

  it('al presionar Entrar con nombre llama setPendingOperatorName con nombre trimmed', async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);
    await user.type(screen.getByLabelText('Campo de nombre'), '  María  ');
    await user.press(screen.getByLabelText('Entrar'));
    expect(useAppStore.getState().pendingOperatorName).toBe('María');
  });

  it('renderiza el botón RawBT en DEV builds Android', () => {
    const originalOS = Platform.OS;
    try {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    } catch {
      (Platform as any).OS = 'android';
    }
    try {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Probar impresión RawBT')).toBeTruthy();
    } finally {
      try {
        Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
      } catch {
        (Platform as any).OS = originalOS;
      }
    }
  });

  it('nombre de admin llama setIsAdminMode(true) y no navega a ShiftOpen', async () => {
    mockVerify.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<LoginScreen />);
    await user.type(screen.getByLabelText('Campo de nombre'), 'AdminUser1');
    await user.press(screen.getByLabelText('Entrar'));
    expect(useAppStore.getState().isAdminMode).toBe(true);
    expect(useAppStore.getState().pendingOperatorName).toBeNull();
  });

  it('nombre de operador no activa isAdminMode', async () => {
    mockVerify.mockResolvedValue(false);
    const user = userEvent.setup();
    render(<LoginScreen />);
    await user.type(screen.getByLabelText('Campo de nombre'), 'Juan');
    await user.press(screen.getByLabelText('Entrar'));
    expect(useAppStore.getState().isAdminMode).toBe(false);
    expect(useAppStore.getState().pendingOperatorName).toBe('Juan');
  });
});
