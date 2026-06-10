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

  async findById(id: string): Promise<Product | null> {
    const rows = this.dbInstance
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .all() as ProductRow[];

    return rows[0] ? toEntity(rows[0]) : null;
  }

  async save(product: Product): Promise<void> {
    this.dbInstance
      .insert(schema.products)
      .values({
        id: product.id,
        name: product.name,
        price_cents: product.priceCents,
        cost_cents: product.costCents,
        active: product.active ? 1 : 0,
        version: product.version,
        created_at: product.createdAt,
      })
      .onConflictDoUpdate({
        target: schema.products.id,
        set: {
          name: product.name,
          price_cents: product.priceCents,
          cost_cents: product.costCents,
          version: product.version,
        },
      })
      .run();
  }

  async deactivate(id: string): Promise<void> {
    this.dbInstance
      .update(schema.products)
      .set({
        active: 0,
        version: sql`${schema.products.version} + 1`,
      })
      .where(eq(schema.products.id, id))
      .run();
  }

  async hasOpenNoteItems(productId: string): Promise<boolean> {
    const rows = this.dbInstance
      .select({ id: schema.note_items.id })
      .from(schema.note_items)
      .innerJoin(schema.notes, eq(schema.note_items.note_id, schema.notes.id))
      .where(
        and(
          eq(schema.note_items.product_id, productId),
          eq(schema.notes.status, 'open'),
        ),
      )
      .limit(1)
      .all();

    return rows.length > 0;
  }
}
