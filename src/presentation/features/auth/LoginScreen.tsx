import * as Sentry from '@sentry/react-native';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminAuthService } from '../../../infrastructure/auth/AdminAuthService';
import { fireRawBTTestIntent, RAWBT_SPIKE_TEST_TEXT } from '../../../infrastructure/printing/RawBTPrinterAdapter';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store';
import { Colors, Rounded, Spacing, Typography } from '../../theme/tokens';

const adminAuthService = new AdminAuthService({
  salt: process.env.EXPO_PUBLIC_ADMIN_SALT ?? '',
});

export function LoginScreen() {
  const activeShift = useAppStore((s) => s.activeShift);
  const [name, setName] = useState('');
  const submitting = useRef(false);

  const handleRawBTSpikePress = async () => {
    const result = await fireRawBTTestIntent(RAWBT_SPIKE_TEST_TEXT);
    console.log('[RawBT Spike] Resultado:', result);
    Sentry.captureMessage(`[smoke-test] rawbt-spike result: ${result}`, 'info');
  };

  async function handleEnter() {
    const trimmed = name.trim();
    if (!trimmed || submitting.current) return;
    submitting.current = true;
    try {
      const isAdmin = await adminAuthService.verify(trimmed);
      if (isAdmin) {
        useAppStore.getState().setIsAdminMode(true);
        return;
      }
      useAppStore.getState().setPendingOperatorName(trimmed);
    } catch {
      // verify() failed unexpectedly — fall through to operator flow without re-throwing
      // trimmed intentionally not logged (AC-ADMIN-04)
      useAppStore.getState().setPendingOperatorName(trimmed);
    } finally {
      submitting.current = false;
    }
  }

  if (activeShift) {
    return (
      <View style={styles.container}>
        <View style={styles.logoBlock} accessibilityRole="image" accessibilityLabel="Logo LavaClean">
          <Text style={styles.wave}>∿</Text>
          <Text style={styles.brand}>LavaClean</Text>
        </View>
        <Text style={styles.subtitle}>Sistema de Punto de Venta</Text>
        <View style={styles.blockCard}>
          <Text style={styles.blockMessage}>Esta sucursal ya tiene un turno activo.</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.logoBlock} accessibilityRole="image" accessibilityLabel="Logo LavaClean">
          <Text style={styles.wave}>∿</Text>
          <Text style={styles.brand}>LavaClean</Text>
        </View>
        <Text style={styles.subtitle}>Sistema de Punto de Venta</Text>

        <View style={styles.formSection}>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.inkDisabled}
            accessibilityLabel="Campo de nombre"
            returnKeyType="done"
            onSubmitEditing={handleEnter}
            style={styles.input}
          />
          <PrimaryButton
            label="Entrar"
            onPress={handleEnter}
            disabled={!name.trim()}
          />
        </View>

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
    </KeyboardAvoidingView>
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
  formSection: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  input: {
    height: Spacing.touchPreferred,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizeLg,
    color: Colors.inkPrimary,
    backgroundColor: Colors.surface,
  },
  blockCard: {
    backgroundColor: Colors.warningBg,
    borderRadius: Rounded.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  blockMessage: {
    color: Colors.inkPrimary,
    fontSize: Typography.sizeLg,
    textAlign: 'center',
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
