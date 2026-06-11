import * as Crypto from 'expo-crypto';

import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import { db as defaultDb, type AppDB } from '../../infrastructure/db/client';
import * as schema from '../../infrastructure/db/schema';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';

export class ReorderProductsUseCase {
  constructor(
    private readonly productRepo: IProductRepository = new ProductRepository(),
    private readonly db: AppDB = defaultDb,
  ) {}

  async execute(
    branchId: string,
    orderedProducts: Product[],
    productId: string,
    direction: 'up' | 'down',
  ): Promise<Product[]> {
    if (!branchId) {
      throw new Error('branch_required');
    }

    const index = orderedProducts.findIndex((product) => product.id === productId);
    if (index === -1) {
      throw new Error('product_not_in_list');
    }
    if (direction === 'up' && index === 0) {
      throw new Error('already_first');
    }
    if (direction === 'down' && index === orderedProducts.length - 1) {
      throw new Error('already_last');
    }

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrder = [...orderedProducts];
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    const allEntries = newOrder.map((product, sortIndex) => ({
      productId: product.id,
      sortOrder: sortIndex + 1,
    }));

    await this.productRepo.saveBranchSort(branchId, allEntries);

    const now = new Date().toISOString();
    const movedEntries = [allEntries[swapIndex], allEntries[index]];
    for (const entry of movedEntries) {
      try {
        this.db
          .insert(schema.outbox)
          .values({
            id: Crypto.randomUUID(),
            entity_type: 'branch_sort',
            entity_id: branchId,
            operation: 'UPDATE',
            payload: JSON.stringify({
              branchId,
              productId: entry.productId,
              sortOrder: entry.sortOrder,
            }),
            idempotency_key: `branch-sort-${branchId}-${entry.productId}-pos${entry.sortOrder}`,
            retry_count: 0,
            last_error: null,
            status: 'pending',
            created_at: now,
          })
          .run();
      } catch (err) {
        console.error('[ReorderProductsUseCase] outbox insert failed:', err);
      }
    }

    return newOrder;
  }
}
