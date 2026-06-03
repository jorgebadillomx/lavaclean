/* eslint-disable @typescript-eslint/no-require-imports */
import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    closeSync: jest.fn(),
  })),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({
    select: () => ({
      from: jest.fn(async () => []),
    }),
  })),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/test-documents/',
  readAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));
