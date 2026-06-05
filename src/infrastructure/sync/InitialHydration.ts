import type { SupabaseClient } from '@supabase/supabase-js';
import type { SQLiteDatabase } from 'expo-sqlite';

import { NetworkErrorClassifier } from './NetworkErrorClassifier';

type HydrationDb = Pick<SQLiteDatabase, 'getFirstSync' | 'runSync' | 'withTransactionSync'>;

type HydrationBranchRow = {
  id: string;
  name: string;
  footer_message: string | null;
  created_at: string;
};

type HydrationProductRow = {
  id: string;
  name: string;
  price_cents: number;
  cost_cents: number | null;
  active: boolean;
  version: number | null;
  created_at: string;
};

type HydrationMetaRow = {
  value: string;
};

type SupabaseResponse<T> = { data: T[] | null; error: unknown | null };

type SupabaseSelectBuilder<T> = PromiseLike<SupabaseResponse<T>> & {
  eq(column: string, value: unknown): SupabaseSelectBuilder<T>;
};

type SupabaseFromBuilder<T> = {
  select(columns?: string): SupabaseSelectBuilder<T>;
};

type HydrationSupabaseClient = Pick<SupabaseClient, 'from'>;

export type HydrationResult =
  | { status: 'Success' }
  | { status: 'Skipped' }
  | { status: 'Failure'; reason?: string };

function mapFailureReason(error: unknown): string {
  const classified = NetworkErrorClassifier.classify(error);
  if (classified === 'DEVICE_OFFLINE' || classified === 'SERVER_UNREACHABLE') {
    return 'offline';
  }

  if (typeof error === 'string') {
    const lower = error.toLowerCase();
    if (lower.includes('timeout') || lower.includes('network request failed') || lower.includes('failed to fetch')) {
      return 'offline';
    }
    return error || 'unknown';
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '').trim();
    if (message.length > 0) {
      const lower = message.toLowerCase();
      if (lower.includes('timeout') || lower.includes('network request failed') || lower.includes('failed to fetch')) {
        return 'offline';
      }
      return message;
    }
  }

  return 'unknown';
}

function hasLastHydratedAt(rawDb: HydrationDb): boolean {
  const row = rawDb.getFirstSync<HydrationMetaRow>(
    "SELECT value FROM _meta WHERE key = 'last_hydrated_at'",
  );
  return row !== null && row !== undefined;
}

export async function hydrateIfNeeded(
  rawDb: HydrationDb,
  supabaseClient: HydrationSupabaseClient,
): Promise<HydrationResult> {
  try {
    if (hasLastHydratedAt(rawDb)) {
      return { status: 'Skipped' };
    }

    const branchesBuilder = supabaseClient.from('branches') as unknown as SupabaseFromBuilder<HydrationBranchRow>;

    const branchesResult = await branchesBuilder.select('id, name, footer_message, created_at');
    if (branchesResult.error !== null && branchesResult.error !== undefined) {
      return { status: 'Failure', reason: mapFailureReason(branchesResult.error) };
    }

    const productsBuilder = supabaseClient.from('products') as unknown as SupabaseFromBuilder<HydrationProductRow>;
    const productsResult = await productsBuilder
      .select('id, name, price_cents, cost_cents, active, version, created_at')
      .eq('active', true);

    if (productsResult.error !== null && productsResult.error !== undefined) {
      return { status: 'Failure', reason: mapFailureReason(productsResult.error) };
    }

    const branches = branchesResult.data ?? [];
    const products = productsResult.data ?? [];

    if (branches.length === 0) {
      return { status: 'Failure', reason: 'empty_branches' };
    }

    if (products.length === 0) {
      return { status: 'Failure', reason: 'empty_products' };
    }

    const hydratedAt = new Date().toISOString();

    rawDb.withTransactionSync(() => {
      for (const branch of branches) {
        rawDb.runSync(
          'INSERT OR REPLACE INTO branches (id, name, footer_message, created_at) VALUES (?, ?, ?, ?)',
          [branch.id, branch.name, branch.footer_message ?? null, branch.created_at],
        );
      }

      for (const product of products) {
        rawDb.runSync(
          'INSERT OR REPLACE INTO products (id, name, price_cents, cost_cents, active, version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            product.id,
            product.name,
            product.price_cents,
            product.cost_cents ?? null,
            product.active ? 1 : 0,
            product.version ?? 1,
            product.created_at,
          ],
        );
      }

      rawDb.runSync(
        "INSERT OR REPLACE INTO _meta (key, value) VALUES ('last_hydrated_at', ?)",
        [hydratedAt],
      );
    });

    return { status: 'Success' };
  } catch (error) {
    return { status: 'Failure', reason: mapFailureReason(error) };
  }
}
