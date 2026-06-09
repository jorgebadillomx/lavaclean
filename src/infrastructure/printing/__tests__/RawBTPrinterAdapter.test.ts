import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { fireRawBTTestIntent, RAWBT_SPIKE_TEST_TEXT } from '../RawBTPrinterAdapter';

const mockStartActivityAsync = jest.spyOn(IntentLauncher, 'startActivityAsync');

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

describe('fireRawBTTestIntent', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  beforeEach(() => {
    setPlatformOS('android');
    mockStartActivityAsync.mockReset();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('sends the RawBT print intent with the expected action and extra payload', async () => {
    mockStartActivityAsync.mockResolvedValueOnce(undefined as never);

    await expect(fireRawBTTestIntent(RAWBT_SPIKE_TEST_TEXT)).resolves.toBe('success');

    expect(mockStartActivityAsync).toHaveBeenCalledWith('android.intent.action.SEND', {
      type: 'text/plain',
      packageName: 'ru.a402d.rawbtprinter',
      className: 'ru.a402d.rawbtprinter.activity.PrintExtraActivity',
      extra: { 'android.intent.extra.TEXT': RAWBT_SPIKE_TEST_TEXT },
    });
  });

  it('classifies the missing RawBT app error as not_installed (No Activity found variant)', async () => {
    mockStartActivityAsync.mockRejectedValueOnce(
      new Error('No Activity found to handle Intent { act=rawbt.api.ACTION_PRINT_TEXT }'),
    );

    await expect(fireRawBTTestIntent('test')).resolves.toBe('not_installed');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[RawBT Spike] Intent failed:',
      'No Activity found to handle Intent { act=rawbt.api.ACTION_PRINT_TEXT }',
    );
  });

  it('classifies the missing RawBT app error as not_installed (React Native / API 36 variant)', async () => {
    mockStartActivityAsync.mockRejectedValueOnce(
      new Error('Could not launch Intent with action rawbt.api.ACTION_PRINT_TEXT.'),
    );

    await expect(fireRawBTTestIntent('test')).resolves.toBe('not_installed');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[RawBT Spike] Intent failed:',
      'Could not launch Intent with action rawbt.api.ACTION_PRINT_TEXT.',
    );
  });

  it('returns error for unexpected intent failures', async () => {
    mockStartActivityAsync.mockRejectedValueOnce(new Error('boom'));

    await expect(fireRawBTTestIntent('test')).resolves.toBe('error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[RawBT Spike] Intent failed:', 'boom');
  });

  it('returns error without calling sendIntent outside Android', async () => {
    setPlatformOS('ios');

    await expect(fireRawBTTestIntent('test')).resolves.toBe('error');
    expect(mockStartActivityAsync).not.toHaveBeenCalled();
  });
});
