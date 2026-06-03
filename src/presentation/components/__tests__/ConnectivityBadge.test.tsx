import { render, waitFor } from '@testing-library/react-native';

import { ConnectivityBadge } from '../ConnectivityBadge';

const netInfo = jest.requireMock('@react-native-community/netinfo') as {
  addEventListener: jest.Mock;
  fetch: jest.Mock;
};

describe('ConnectivityBadge', () => {
  beforeEach(() => {
    netInfo.fetch.mockReset();
    netInfo.addEventListener.mockReset();
    // Default: return a valid unsubscribe function so cleanup never throws
    netInfo.addEventListener.mockReturnValue(jest.fn());
  });

  it('renders nothing when online', async () => {
    netInfo.fetch.mockResolvedValue({ isConnected: true });
    netInfo.addEventListener.mockImplementation((listener) => {
      listener({ isConnected: true });
      return jest.fn();
    });

    const { queryByText } = render(<ConnectivityBadge />);

    await waitFor(() => {
      expect(queryByText('Sin conexión')).toBeNull();
    });
  });

  it('renders the offline badge when disconnected', async () => {
    netInfo.fetch.mockResolvedValue({ isConnected: false });
    netInfo.addEventListener.mockImplementation((listener) => {
      listener({ isConnected: false });
      return jest.fn();
    });

    const { getByText } = render(<ConnectivityBadge />);

    await waitFor(() => {
      expect(getByText('Sin conexión')).toBeTruthy();
    });
  });
});
