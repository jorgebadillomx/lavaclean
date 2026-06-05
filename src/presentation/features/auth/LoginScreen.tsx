import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fireRawBTTestIntent, RAWBT_SPIKE_TEST_TEXT } from '../../../infrastructure/printing/RawBTPrinterAdapter';
import { Colors, Spacing, Typography } from '../../theme/tokens';

export function LoginScreen() {
  const handleRawBTSpikePress = async () => {
    const result = await fireRawBTTestIntent(RAWBT_SPIKE_TEST_TEXT);
    console.log('[RawBT Spike] Resultado:', result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBlock} accessibilityRole="image" accessibilityLabel="Logo LavaClean">
        <Text style={styles.wave}>∿</Text>
        <Text style={styles.brand}>LavaClean</Text>
      </View>
      <Text style={styles.subtitle}>Sistema de Punto de Venta</Text>
      {__DEV__ && Platform.OS === 'android' ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Probar impresión RawBT"
          onPress={() => {
            void handleRawBTSpikePress();
          }}
          style={styles.rawbtSpikeButton}
        >
          <Text style={styles.rawbtSpikeButtonLabel}>[DEV] Spike RawBT</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  logoBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    color: Colors.brandTeal,
    fontSize: 64,
    lineHeight: 72,
  },
  brand: {
    color: Colors.primary,
    fontSize: Typography.sizeXl,
    fontWeight: Typography.weightBold,
    marginTop: Spacing.xs,
  },
  subtitle: {
    color: Colors.inkSecondary,
    fontSize: Typography.sizeSm,
    marginTop: Spacing.sm,
  },
  rawbtSpikeButton: {
    backgroundColor: '#FFD600',
    borderRadius: 12,
    marginTop: 32,
    minWidth: 180,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rawbtSpikeButtonLabel: {
    color: '#000000',
    fontSize: Typography.sizeSm,
    fontWeight: Typography.weightBold,
    textAlign: 'center',
  },
});
