import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Colors, Spacing, Typography } from '../../theme/tokens';

export function LoginScreen() {
  useEffect(() => {
    // Smoke test temporal para validar la integración de Sentry en Sprint 0.
    Sentry.captureException(new Error('smoke-test'));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBlock} accessibilityRole="image" accessibilityLabel="Logo LavaClean">
        <Text style={styles.wave}>∿</Text>
        <Text style={styles.brand}>LavaClean</Text>
      </View>
      <Text style={styles.subtitle}>Sistema de Punto de Venta</Text>
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
});
