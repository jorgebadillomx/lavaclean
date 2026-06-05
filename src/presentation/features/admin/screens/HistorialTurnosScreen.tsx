import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../../theme/tokens';

export function HistorialTurnosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Turnos</Text>
      <Text style={styles.placeholder}>(Epic 7)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.lg },
  title: { fontSize: Typography.sizeXl, fontWeight: Typography.weightBold, color: Colors.inkPrimary },
  placeholder: { fontSize: Typography.sizeSm, color: Colors.inkSecondary, marginTop: Spacing.sm },
});
