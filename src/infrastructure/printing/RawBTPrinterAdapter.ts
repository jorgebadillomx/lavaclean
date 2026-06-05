import { Linking, Platform } from 'react-native';

export const RAWBT_ACTION = 'rawbt.api.ACTION_PRINT_TEXT';
export const RAWBT_EXTRA_KEY = 'rawbt.api.EXTRA_PRINT_TEXT';
export const RAWBT_SPIKE_TEST_TEXT = '--- SPIKE LAVACLEAN ---\nTest de impresión\n\n\n';

export type RawBTTestIntentResult = 'success' | 'not_installed' | 'error';

function isRawBTNotInstalledError(errorMessage: string): boolean {
  return (
    errorMessage.includes('ActivityNotFoundException') ||
    errorMessage.includes('No Activity found') ||
    errorMessage.includes('Could not launch Intent')
  );
}

export async function fireRawBTTestIntent(testText: string): Promise<RawBTTestIntentResult> {
  if (Platform.OS !== 'android') {
    return 'error';
  }

  try {
    await Linking.sendIntent(RAWBT_ACTION, [
      { key: RAWBT_EXTRA_KEY, value: testText },
    ]);
    return 'success';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[RawBT Spike] Intent failed:', message);

    if (isRawBTNotInstalledError(message)) {
      return 'not_installed';
    }

    return 'error';
  }
}
