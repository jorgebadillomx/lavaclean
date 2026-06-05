// Implementación de expo-sqlite usando node:sqlite para tests que necesitan SQLite real.
// Uso: jest.mock('expo-sqlite', () => require('../../test-utils/expoSQLiteMock').expoSQLiteMock())
// También llamar jest.unmock('drizzle-orm/expo-sqlite') antes de los imports.

/* eslint-disable @typescript-eslint/no-require-imports */
export function expoSQLiteMock() {
  const { DatabaseSync } = require('node:sqlite');

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

  function createDb(path = ':memory:') {
    const ndb = new DatabaseSync(path);
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
    openDatabaseSync: (path?: string) => createDb(path),
  };
}
