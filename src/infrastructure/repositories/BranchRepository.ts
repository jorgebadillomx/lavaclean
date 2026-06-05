import { eq } from 'drizzle-orm';

import { db as defaultDb, type AppDB } from '../db/client';
import * as schema from '../db/schema';
import type { Branch } from '../../domain/entities/Branch';
import type { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import type { BranchRow } from '../db/rows/BranchRow';

function toEntity(row: BranchRow): Branch {
  return {
    id: row.id,
    name: row.name,
    footerMessage: row.footer_message,
    createdAt: row.created_at,
  };
}

function toRow(branch: Branch) {
  return {
    id: branch.id,
    name: branch.name,
    footer_message: branch.footerMessage,
    created_at: branch.createdAt,
  };
}

export class BranchRepository implements IBranchRepository {
  constructor(private readonly dbInstance: AppDB = defaultDb) {}

  async findAll(): Promise<Branch[]> {
    const rows = this.dbInstance.select().from(schema.branches).all() as BranchRow[];
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Branch | null> {
    const row = this.dbInstance.select()
      .from(schema.branches)
      .where(eq(schema.branches.id, id))
      .all()[0] as BranchRow | undefined;

    return row ? toEntity(row) : null;
  }

  async save(branch: Branch): Promise<void> {
    this.dbInstance.insert(schema.branches)
      .values(toRow(branch))
      .onConflictDoUpdate({
        target: schema.branches.id,
        set: {
          name: branch.name,
          footer_message: branch.footerMessage,
          created_at: branch.createdAt,
        },
      })
      .run();
  }
}
