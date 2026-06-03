import * as Sentry from '@sentry/react-native';
import { render } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('LoginScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the LavaClean brand without crashing', () => {
    const { getByText } = render(<LoginScreen />);

    expect(getByText('LavaClean')).toBeTruthy();
    expect(getByText('Sistema de Punto de Venta')).toBeTruthy();
  });

  it('fires Sentry smoke-test on mount', () => {
    render(<LoginScreen />);
    expect(Sentry.captureException).toHaveBeenCalledWith(new Error('smoke-test'));
  });
});
