import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen', () => {
  beforeAll(() => {
    try {
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'android',
      });
    } catch {
      (Platform as any).OS = 'android';
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the LavaClean brand without crashing', () => {
    const { getByText } = render(<LoginScreen />);

    expect(getByText('LavaClean')).toBeTruthy();
    expect(getByText('Sistema de Punto de Venta')).toBeTruthy();
  });

  it('renders the RawBT spike button in Android dev builds', () => {
    const { getByLabelText } = render(<LoginScreen />);

    expect(getByLabelText('Probar impresión RawBT')).toBeTruthy();
  });

  it('does not render the RawBT spike button in staging/production builds (__DEV__ = false)', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    try {
      const { queryByLabelText } = render(<LoginScreen />);
      expect(queryByLabelText('Probar impresión RawBT')).toBeNull();
    } finally {
      (global as any).__DEV__ = originalDev;
    }
  });
});
