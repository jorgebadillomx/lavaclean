import * as Crypto from 'expo-crypto';

import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import { db as defaultDb, type AppDB } from '../../infrastructure/db/client';
import * as schema from '../../infrastructure/db/schema';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';

export class DeactivateProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository = new ProductRepository(),
    private readonly db: AppDB = defaultDb,
  ) {}

  async execute(productId: string): Promise<void> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new Error('product_not_found');
    }
    if (!product.active) {
      throw new Error('product_already_inactive');
    }

    await this.productRepo.deactivate(productId);

    const now = new Date().toISOString();
    const deactivatedProduct: Product = {
      ...product,
      active: false,
      version: product.version + 1,
    };

    try {
      this.db
        .insert(schema.outbox)
        .values({
          id: Crypto.randomUUID(),
          entity_type: 'product',
          entity_id: productId,
          operation: 'UPDATE',
          payload: JSON.stringify(deactivatedProduct),
          idempotency_key: `product-deactivate-${productId}`,
          retry_count: 0,
          last_error: null,
          status: 'pending',
          created_at: now,
        })
        .run();
    } catch (err) {
      console.error('[DeactivateProductUseCase] outbox insert failed:', err);
    }
  }
}
