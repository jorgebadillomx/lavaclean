import * as Crypto from 'expo-crypto';

import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import { db as defaultDb, type AppDB } from '../../infrastructure/db/client';
import * as schema from '../../infrastructure/db/schema';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';

export type SaveProductInput = {
  id?: string;
  name: string;
  priceCents: number;
  costCents: number | null;
};

export class SaveProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository = new ProductRepository(),
    private readonly db: AppDB = defaultDb,
  ) {}

  async execute(input: SaveProductInput): Promise<Product> {
    const name = input.name.trim();
    if (!name || input.priceCents <= 0) {
      throw new Error('validation_failed');
    }
    if (input.costCents !== null && input.costCents < 0) {
      throw new Error('validation_failed');
    }

    const isNew = !input.id;
    const id = input.id ?? Crypto.randomUUID();
    const now = new Date().toISOString();

    let version = 1;
    let createdAt = now;

    if (!isNew) {
      const existing = await this.productRepo.findById(id);
      if (!existing) throw new Error('product_not_found');
      version = existing.version + 1;
      createdAt = existing.createdAt;
    }

    const product: Product = {
      id,
      name,
      priceCents: input.priceCents,
      costCents: input.costCents,
      active: true,
      version,
      createdAt,
    };

    await this.productRepo.save(product);

    try {
      this.db
        .insert(schema.outbox)
        .values({
          id: Crypto.randomUUID(),
          entity_type: 'product',
          entity_id: id,
          operation: isNew ? 'INSERT' : 'UPDATE',
          payload: JSON.stringify(product),
          idempotency_key: `product-${id}-${version}`,
          retry_count: 0,
          last_error: null,
          status: 'pending',
          created_at: now,
        })
        .run();
    } catch (err) {
      console.error('[SaveProductUseCase] outbox insert failed:', err);
    }

    return product;
  }
}
