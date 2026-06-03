import {
  NetworkErrorClassifier,
  NetworkErrorType,
} from '../NetworkErrorClassifier';

describe('NetworkErrorClassifier — AC-SYNC-01', () => {
  it('AC-SYNC-01a: error con mensaje "Network request failed" → DEVICE_OFFLINE', () => {
    const error = new Error('Network request failed');
    expect(NetworkErrorClassifier.classify(error)).toBe<NetworkErrorType>('DEVICE_OFFLINE');
  });

  it('AC-SYNC-01b: error de timeout → SERVER_UNREACHABLE', () => {
    const error = new Error('Request timeout');
    expect(NetworkErrorClassifier.classify(error)).toBe<NetworkErrorType>('SERVER_UNREACHABLE');
  });

  it('AC-SYNC-01c: respuesta HTTP 500 → SERVER_ERROR', () => {
    const error = { status: 500 };
    expect(NetworkErrorClassifier.classify(error)).toBe<NetworkErrorType>('SERVER_ERROR');
  });

  it('AC-SYNC-01d: respuesta HTTP 503 (proyecto Supabase pausado) → SERVER_PAUSED', () => {
    const error = { status: 503 };
    expect(NetworkErrorClassifier.classify(error)).toBe<NetworkErrorType>('SERVER_PAUSED');
  });

  it('AC-SYNC-01e: respuesta HTTP 401 con mensaje JWT → AUTH_EXPIRED', () => {
    const error = { status: 401, message: 'JWT expired' };
    expect(NetworkErrorClassifier.classify(error)).toBe<NetworkErrorType>('AUTH_EXPIRED');
  });
});
