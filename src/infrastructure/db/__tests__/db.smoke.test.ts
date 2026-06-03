/* eslint-disable @typescript-eslint/no-require-imports, import/first */
jest.unmock('drizzle-orm/expo-sqlite');
jest.mock('expo-sqlite', () => {
  const { DatabaseSync } = require('node:sqlite');

  function createDb(path: string) {
    const ndb = new DatabaseSync(path);

    function buildStmtResult(stmt: any, isSelect: boolean, params: unknown[]) {
      if (isSelect) {
        const rows = stmt.all(...params) as Record<string, unknown>[];
        return {
          getAllSync: () => rows,
          getFirstSync: () => rows[0] ?? null,
          changes: 0,
          lastInsertRowId: 0,
        };
      }
      const res = stmt.run(...params) as { changes: number; lastInsertRowid: bigint | number };
      return {
        getAllSync: () => [] as unknown[],
        getFirstSync: () => null,
        changes: res.changes,
        lastInsertRowId: Number(res.lastInsertRowid),
      };
    }

    return {
      execSync(sql: string) {
        ndb.exec(sql);
      },
      getFirstSync<T>(sql: string, params: unknown[] = []): T | null {
        const stmt = ndb.prepare(sql);
        return (stmt.get(...params) ?? null) as T | null;
      },
      withTransactionSync(fn: () => void) {
        ndb.exec('BEGIN TRANSACTION;');
        try {
          fn();
          ndb.exec('COMMIT;');
        } catch (e) {
          ndb.exec('ROLLBACK;');
          throw e;
        }
      },
      runSync(sql: string, params: unknown[] = []) {
        const stmt = ndb.prepare(sql);
        const res = stmt.run(...params) as { changes: number; lastInsertRowid: bigint | number };
        return { changes: res.changes, lastInsertRowId: Number(res.lastInsertRowid) };
      },
      prepareSync(sql: string) {
        const stmt = ndb.prepare(sql);
        const isSelect = /^\s*(SELECT|WITH)\b/i.test(sql);
        return {
          executeSync(params: unknown[] = []) {
            return buildStmtResult(stmt, isSelect, params);
          },
          executeForRawResultSync(params: unknown[] = []) {
            const rows = stmt.all(...params) as Record<string, unknown>[];
            return {
              getAllSync: () => rows.map((row) => Object.values(row)),
            };
          },
        };
      },
      closeSync() {
        ndb.close();
      },
    };
  }

  return {
    openDatabaseSync: (path: string) => createDb(path),
  };
});

import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../schema';
import { runMigrations } from '../migrations';

it('opens SQLite in memory, runs migrations, and selects from schema.shifts without throwing', () => {
  const rawDb = openDatabaseSync(':memory:');
  rawDb.execSync('PRAGMA foreign_keys = ON;');
  rawDb.execSync('PRAGMA journal_mode = WAL;');
  runMigrations(rawDb);
  const db = drizzle(rawDb, { schema });

  const result = db.select().from(schema.shifts).limit(1).all();

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  rawDb.closeSync();
});
