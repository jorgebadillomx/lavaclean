import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { FlatList, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import { BranchRepository } from '../../../../infrastructure/repositories/BranchRepository';
import { supabase as defaultSupabase } from '../../../../infrastructure/sync/SupabaseClient';
import { db as defaultDb, type AppDB } from '../../../../infrastructure/db/client';
import * as schema from '../../../../infrastructure/db/schema';
import type { Branch } from '../../../../domain/entities/Branch';
import type { IBranchRepository } from '../../../../domain/repositories/IBranchRepository';
import { useAppStore } from '../../../store';
import { Colors, Rounded, Spacing, Typography } from '../../../theme/tokens';
import { PrimaryButton } from '../../../components/PrimaryButton';

type BranchSelectScreenProps = {
  repository?: IBranchRepository;
  supabaseClient?: Pick<typeof defaultSupabase, 'from'>;
  dbInstance?: AppDB;
};

function toBranch(entity: { id: string; name: string; footer_message: string | null; created_at: string }): Branch {
  return {
    id: entity.id,
    name: entity.name,
    footerMessage: entity.footer_message,
    createdAt: entity.created_at,
  };
}

export function BranchSelectScreen({
  repository,
  dbInstance = defaultDb,
  supabaseClient = defaultSupabase,
}: BranchSelectScreenProps) {
  const branchRepository = useMemo(() => repository ?? new BranchRepository(dbInstance), [dbInstance, repository]);
  const resolvedSupabaseClient = supabaseClient;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    // P5: treat null (Android unknown state) as potentially connected
    const connection = await NetInfo.fetch().catch(() => ({ isConnected: false }));

    if (connection.isConnected !== false) {
      try {
        // P3: wrap entire remote path so save() failures fall through to cache
        const response = await resolvedSupabaseClient.from('branches').select('*');
        if (!response.error) {
          const remoteBranches = ((response.data ?? []) as {
            id: string;
            name: string;
            footer_message: string | null;
            created_at: string;
          }[]).map(toBranch);

          // P1: only trust non-empty remote results; empty list falls through to cache
          if (remoteBranches.length > 0) {
            for (const branch of remoteBranches) {
              await branchRepository.save(branch);
            }

            setBranches(remoteBranches);
            setSelectedBranchId((current) => {
              if (current && remoteBranches.some((branch) => branch.id === current)) {
                return current;
              }
              return remoteBranches[0]?.id ?? null;
            });
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Supabase or save() failed — fall through to cache
      }
    }

    const cachedBranches = await branchRepository.findAll();
    if (cachedBranches.length > 0) {
      setBranches(cachedBranches);
      setSelectedBranchId((current) => {
        if (current && cachedBranches.some((branch) => branch.id === current)) {
          return current;
        }
        return cachedBranches[0]?.id ?? null;
      });
      setIsLoading(false);
      setMessage(null);
      return;
    }

    setBranches([]);
    setSelectedBranchId(null);
    setIsLoading(false);
    setMessage('Se necesita conexión para configurar la sucursal la primera vez.');
  }, [branchRepository, resolvedSupabaseClient]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadBranches();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadBranches]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && !isLoading && branches.length === 0) {
        void loadBranches();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [branches.length, isLoading, loadBranches]);

  const handleConfirmBranch = useCallback(() => {
    if (!selectedBranchId) {
      return;
    }
    // P2: validate branchId exists in the currently loaded list (spec PASO 1)
    if (!branches.some((b) => b.id === selectedBranchId)) {
      return;
    }

    try {
      // P4: wrap SQLite write — if it fails, don't advance and show feedback
      dbInstance.insert(schema._meta)
        .values({ key: 'active_branch_id', value: selectedBranchId })
        .onConflictDoUpdate({
          target: schema._meta.key,
          set: { value: selectedBranchId },
        })
        .run();
      useAppStore.getState().setActiveBranch(selectedBranchId);
    } catch {
      setMessage('Error al guardar la sucursal. Intenta de nuevo.');
    }
  }, [dbInstance, selectedBranchId, branches]);

  return (
    <View style={styles.screen}>
      <View style={styles.hero} accessibilityRole="image" accessibilityLabel="Logo LavaClean">
        <Text style={styles.wave}>∿</Text>
        <Text style={styles.brand}>LavaClean</Text>
      </View>

      <Text style={styles.title}>Selecciona tu sucursal</Text>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : message ? (
          <Text accessibilityRole="text" style={styles.message}>
            {message}
          </Text>
        ) : (
          <FlatList
            data={branches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedBranchId;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  onPress={() => {
                    setSelectedBranchId(item.id);
                  }}
                  style={[
                    styles.branchCard,
                    isSelected ? styles.branchCardSelected : null,
                  ]}
                >
                  <Text style={styles.branchName}>{item.name}</Text>
                  <Text style={styles.branchId}>{item.id}</Text>
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {branches.length > 0 ? (
        <View style={styles.footer}>
          <PrimaryButton
            label="Confirmar sucursal"
            onPress={() => {
              handleConfirmBranch();
            }}
            disabled={!selectedBranchId}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  hero: {
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
    fontWeight: Typography.weightMedium,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginTop: Spacing.lg,
  },
  loadingBlock: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    color: Colors.inkSecondary,
    fontSize: Typography.sizeSm,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: Spacing.md,
  },
  branchCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Rounded.lg,
    borderWidth: 1,
    minHeight: Spacing.touchMin,
    padding: Spacing.md,
  },
  branchCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  branchName: {
    color: Colors.inkPrimary,
    fontSize: Typography.sizeLg,
    fontWeight: Typography.weightMedium,
  },
  branchId: {
    color: Colors.inkSecondary,
    fontSize: Typography.sizeSm,
    marginTop: Spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  footer: {
    paddingTop: Spacing.md,
  },
});
