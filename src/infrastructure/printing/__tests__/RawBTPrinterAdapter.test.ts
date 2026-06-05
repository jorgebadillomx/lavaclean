import { Linking, Platform } from 'react-native';
import {
  fireRawBTTestIntent,
  RAWBT_ACTION,
  RAWBT_EXTRA_KEY,
  RAWBT_SPIKE_TEST_TEXT,
} from '../RawBTPrinterAdapter';

const mockSendIntent = jest.fn();

function setPlatformOS(os: string): void {
  try {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: os,
    });
  } catch {
    (Platform as { OS: string }).OS = os;
  }
}

function setSendIntentMock(): void {
  try {
    Object.defineProperty(Linking, 'sendIntent', {
      configurable: true,
      value: mockSendIntent,
    });
  } catch {
    (Linking as any).sendIntent = mockSendIntent;
  }
}

describe('fireRawBTTestIntent', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  beforeAll(() => {
    setSendIntentMock();
  });

  beforeEach(() => {
    setPlatformOS('android');
    mockSendIntent.mockReset();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('sends the RawBT print intent with the expected action and extra payload', async () => {
    mockSendIntent.mockResolvedValueOnce(undefined);

    await expect(fireRawBTTestIntent(RAWBT_SPIKE_TEST_TEXT)).resolves.toBe('success');

    expect(mockSendIntent).toHaveBeenCalledWith(RAWBT_ACTION, [
      { key: RAWBT_EXTRA_KEY, value: RAWBT_SPIKE_TEST_TEXT },
    ]);
  });

  it('classifies the missing RawBT app error as not_installed (No Activity found variant)', async () => {
    mockSendIntent.mockRejectedValueOnce(
      new Error('No Activity found to handle Intent { act=rawbt.api.ACTION_PRINT_TEXT }'),
    );

    await expect(fireRawBTTestIntent('test')).resolves.toBe('not_installed');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[RawBT Spike] Intent failed:',
      'No Activity found to handle Intent { act=rawbt.api.ACTION_PRINT_TEXT }',
    );
  });

  it('classifies the missing RawBT app error as not_installed (React Native / API 36 variant)', async () => {
    mockSendIntent.mockRejectedValueOnce(
      new Error('Could not launch Intent with action rawbt.api.ACTION_PRINT_TEXT.'),
    );

    await expect(fireRawBTTestIntent('test')).resolves.toBe('not_installed');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[RawBT Spike] Intent failed:',
      'Could not launch Intent with action rawbt.api.ACTION_PRINT_TEXT.',
    );
  });

  it('returns error for unexpected intent failures', async () => {
    mockSendIntent.mockRejectedValueOnce(new Error('boom'));

    await expect(fireRawBTTestIntent('test')).resolves.toBe('error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[RawBT Spike] Intent failed:', 'boom');
  });

  it('returns error without calling sendIntent outside Android', async () => {
    setPlatformOS('ios');

    await expect(fireRawBTTestIntent('test')).resolves.toBe('error');
    expect(mockSendIntent).not.toHaveBeenCalled();
  });
});
