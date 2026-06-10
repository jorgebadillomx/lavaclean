import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

export const RAWBT_PACKAGE = 'ru.a402d.rawbtprinter';
export const RAWBT_SPIKE_TEST_TEXT = '--- SPIKE LAVACLEAN ---\nTest de impresión\n\n\n';

export type RawBTTestIntentResult = 'success' | 'not_installed' | 'error';

export async function fireRawBTTestIntent(testText: string): Promise<RawBTTestIntentResult> {
  if (Platform.OS !== 'android') {
    return 'error';
  }

  try {
    await IntentLauncher.startActivityAsync('android.intent.action.SEND', {
      type: 'text/plain',
      packageName: RAWBT_PACKAGE,
      className: `${RAWBT_PACKAGE}.activity.PrintExtraActivity`,
      extra: { 'android.intent.extra.TEXT': testText },
    });
    return 'success';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[RawBT Spike] Intent failed:', message);

    if (
      message.includes('ActivityNotFoundException') ||
      message.includes('No Activity found') ||
      message.includes('Could not launch Intent') ||
      message.includes('not found')
    ) {
      return 'not_installed';
    }

    return 'error';
  }
}
