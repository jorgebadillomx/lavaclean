import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../../theme/tokens';

export function ProductosAdminScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos</Text>
      <Text style={styles.placeholder}>(Epic 3)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.lg },
  title: { fontSize: Typography.sizeXl, fontWeight: Typography.weightBold, color: Colors.inkPrimary },
  placeholder: { fontSize: Typography.sizeSm, color: Colors.inkSecondary, marginTop: Spacing.sm },
});
