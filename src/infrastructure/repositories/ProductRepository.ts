import { and, asc, eq, sql } from 'drizzle-orm';

import { db as defaultDb, type AppDB } from '../db/client';
import * as schema from '../db/schema';
import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import type { ProductRow } from '../db/rows/ProductRow';

function toEntity(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    priceCents: row.price_cents,
    costCents: row.cost_cents,
    active: row.active === 1,
    version: row.version,
    createdAt: row.created_at,
  };
}

export class ProductRepository implements IProductRepository {
  constructor(private readonly dbInstance: AppDB = defaultDb) {}

  async findAllActive(branchId: string | null): Promise<Product[]> {
    const rows = this.dbInstance
      .select({
        id: schema.products.id,
        name: schema.products.name,
        price_cents: schema.products.price_cents,
        cost_cents: schema.products.cost_cents,
        active: schema.products.active,
        version: schema.products.version,
        created_at: schema.products.created_at,
      })
      .from(schema.products)
      .leftJoin(
        schema.branch_sort,
        and(
          eq(schema.branch_sort.product_id, schema.products.id),
          branchId ? eq(schema.branch_sort.branch_id, branchId) : sql`0 = 1`
        )
      )
      .where(eq(schema.products.active, 1))
      .orderBy(
        sql`COALESCE(${schema.branch_sort.sort_order}, 9999999)`,
        asc(schema.products.created_at)
      )
      .all() as ProductRow[];

    return rows.map(toEntity);
  }
}
