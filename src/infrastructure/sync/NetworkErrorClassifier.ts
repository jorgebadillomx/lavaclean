export type NetworkErrorType =
  | 'DEVICE_OFFLINE'
  | 'SERVER_UNREACHABLE'
  | 'SERVER_ERROR'
  | 'SERVER_PAUSED'
  | 'AUTH_EXPIRED';

export class AppNetworkError extends Error {
  constructor(
    public readonly type: NetworkErrorType,
    public readonly originalError?: unknown,
  ) {
    super(type);
    this.name = 'AppNetworkError';
  }
}

export class NetworkErrorClassifier {
  static classify(error: unknown): NetworkErrorType {
    if (NetworkErrorClassifier.isOfflineError(error)) return 'DEVICE_OFFLINE';

    const status = NetworkErrorClassifier.extractHttpStatus(error);
    if (status !== null) {
      if (status === 401 || status === 403) return 'AUTH_EXPIRED';
      if (status === 402 || status === 503) return 'SERVER_PAUSED';
      if (status >= 500) return 'SERVER_ERROR';
    }

    if (NetworkErrorClassifier.isNetworkError(error)) return 'SERVER_UNREACHABLE';

    return 'SERVER_ERROR';
  }

  private static isOfflineError(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return msg.includes('network request failed') || msg.includes('offline');
    }
    return false;
  }

  private static extractHttpStatus(error: unknown): number | null {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: unknown }).status;
      if (typeof status === 'number') return status;
    }
    return null;
  }

  private static isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return (
        msg.includes('timeout') ||
        msg.includes('econnrefused') ||
        msg.includes('failed to fetch') ||
        msg.includes('getaddrinfo') ||
        msg.includes('enotfound')
      );
    }
    return false;
  }
}
