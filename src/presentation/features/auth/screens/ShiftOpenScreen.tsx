import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../../store';
import { Colors, Spacing, Typography } from '../../../theme/tokens';

export function ShiftOpenScreen() {
  const operatorName = useAppStore((s) => s.pendingOperatorName);

  function handleBack() {
    useAppStore.getState().setPendingOperatorName(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoBlock} accessibilityRole="image" accessibilityLabel="Logo LavaClean">
        <Text style={styles.wave}>∿</Text>
        <Text style={styles.brand}>LavaClean</Text>
      </View>

      <Text style={styles.title}>Apertura de Turno</Text>
      {operatorName ? (
        <Text style={styles.operator}>Hola, {operatorName}</Text>
      ) : null}
      <Text style={styles.placeholder}>(Formulario de efectivo inicial — Epic 4a)</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver al inicio de sesión"
        onPress={handleBack}
        style={styles.backButton}
      >
        <Text style={styles.backLabel}>← Volver</Text>
      </Pressable>
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
  title: {
    color: Colors.inkPrimary,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightBold,
    marginTop: Spacing.lg,
  },
  operator: {
    color: Colors.inkSecondary,
    fontSize: Typography.sizeBase,
    marginTop: Spacing.sm,
  },
  placeholder: {
    color: Colors.inkDisabled,
    fontSize: Typography.sizeSm,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  backButton: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
  },
  backLabel: {
    color: Colors.primary,
    fontSize: Typography.sizeBase,
  },
});
