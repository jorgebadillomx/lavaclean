import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '../store';
import { hydrateStore } from '../store/hydration/hydrateStore';

interface Props {
  children: React.ReactNode;
}

export function InitializationGate({ children }: Props) {
  const initStatus = useAppStore(s => s.initializationStatus);
  const initError = useAppStore(s => s.initializationError);
  const resetInitialization = useAppStore(s => s.resetInitialization);

  useEffect(() => {
    if (initStatus === 'UNINITIALIZED') {
      hydrateStore();
    }
  }, [initStatus]);

  // G3 (ADR-006): ningún componente de negocio se monta antes de READY
  if (initStatus === 'UNINITIALIZED' || initStatus === 'LOADING_DB' || initStatus === 'HYDRATING_STORE') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.label}>Iniciando LavaClean...</Text>
      </View>
    );
  }

  if (initStatus === 'ERROR') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error al iniciar</Text>
        <Text style={styles.errorMsg}>{initError ?? 'Error desconocido'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            resetInitialization(); // G5: vuelve a UNINITIALIZED limpiamente, el useEffect re-ejecuta la hidratación
          }}
          accessibilityLabel="Reintentar inicialización"
        >
          <Text style={styles.retryLabel}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // initStatus === 'READY'
  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  label: { fontSize: 16 },
  errorTitle: { fontSize: 18, fontWeight: 'bold' },
  errorMsg: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  retryButton: { marginTop: 16, padding: 12, backgroundColor: '#333', borderRadius: 8 },
  retryLabel: { color: '#fff', fontSize: 16 },
});
