import { render, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LoginScreen } from '../LoginScreen';
import { useAppStore } from '../../../store';

jest.mock('../../../../infrastructure/printing/RawBTPrinterAdapter', () => ({
  fireRawBTTestIntent: jest.fn(),
  RAWBT_SPIKE_TEST_TEXT: 'TEST',
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeShift: null,
      pendingOperatorName: null,
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
});
