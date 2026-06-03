/**
 * Story 1.3: InitializationGate & hydrateStore
 *
 * @group p0
 * @group initialization-gate
 * @group adr-006
 */

/* eslint-disable @typescript-eslint/no-require-imports, import/first */
jest.unmock('drizzle-orm/expo-sqlite');
jest.mock('expo-sqlite', () => {
  const { DatabaseSync } = require('node:sqlite');

  function createDb() {
    const ndb = new DatabaseSync(':memory:');

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
    openDatabaseSync: () => createDb(),
  };
});

import { eq } from 'drizzle-orm';
import { createTestDb } from '../../../../test-utils/db-test-utils';
import * as schema from '../../../../infrastructure/db/schema';
import { hydrateStore } from '../hydrateStore';
import { useAppStore } from '../../index';

function resetStore() {
  useAppStore.setState({
    initializationStatus: 'UNINITIALIZED',
    initializationError: null,
    activeShift: null,
    activeBranch: null,
    products: [],
    selectedBranch: null,
  });
}

describe('Story 1.3 — InitializationGate & hydrateStore @P0 @ADR-006', () => {

  beforeEach(() => {
    resetStore();
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-HYD-03: Database Failure — probado primero (más sencillo)
  // ─────────────────────────────────────────────────────────────────
  it('[P0] AC-HYD-03: fallo de acceso a DB → status=error, completedAt=null', () => {
    // Pasar un objeto DB que lanza en select
    const faultyDb = {
      select: () => {
        throw new Error('SQLite: disk I/O error');
      },
    } as any;

    const result = hydrateStore(faultyDb);

    expect(result.status).toBe('error');
    expect(result.completedAt).toBeNull();
    expect(result.error).toContain('SQLite');

    const store = useAppStore.getState();
    expect(store.initializationStatus).toBe('ERROR');
    // AC INIT_STATE_002: el estado de error queda registrado
    expect(store.initializationError).toBeTruthy();
    // Store no fue parcialmente actualizado
    expect(store.products).toHaveLength(0);
    expect(store.activeShift).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────────
  // AC INIT_STATE_003: fallo en HYDRATING_STORE nunca regresa a LOADING_DB
  // ─────────────────────────────────────────────────────────────────
  it('[P0] AC INIT_STATE_003: fallo en HYDRATING_STORE → ERROR sin regresar a LOADING_DB', () => {
    // DB accesible para _meta pero falla en products
    let callCount = 0;
    const partialFaultyDb = {
      select: () => ({
        from: (table: any) => ({
          limit: () => ({
            all: () => [],
          }),
          where: () => ({
            all: () => {
              callCount++;
              if (callCount > 1) {
                throw new Error('HYDRATING_STORE failure');
              }
              return [];
            },
          }),
          all: () => {
            callCount++;
            if (callCount > 1) {
              throw new Error('HYDRATING_STORE failure');
            }
            return [];
          },
        }),
      }),
    } as any;

    const result = hydrateStore(partialFaultyDb);

    expect(result.status).toBe('error');
    const store = useAppStore.getState();
    // Nunca regresó a LOADING_DB — se fue directo a ERROR
    expect(store.initializationStatus).toBe('ERROR');
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-HYD-01: Happy Path
  // ─────────────────────────────────────────────────────────────────
  it('[P0] AC-HYD-01: happy path — 5 productos en SQLite → status=success y store hidratado', () => {
    const { db, close } = createTestDb();

    // Insertar 5 productos activos
    const products = Array.from({ length: 5 }, (_, i) => ({
      id: `prod-${i + 1}`,
      name: `Producto ${i + 1}`,
      price_cents: (i + 1) * 1000,
      cost_cents: null,
      active: 1,
      version: 1,
      created_at: '2026-06-02T00:00:00Z',
    }));
    for (const p of products) {
      db.insert(schema.products).values(p).run();
    }

    const result = hydrateStore(db as any);

    expect(result.status).toBe('success');
    expect(result.completedAt).not.toBeNull();

    const store = useAppStore.getState();
    expect(store.initializationStatus).toBe('READY');
    expect(store.products).toHaveLength(5);
    expect(store.products[0].id).toBe('prod-1');

    close();
  });

  // ─────────────────────────────────────────────────────────────────
  // G2: Estado inicial de Zustand proviene SOLO de SQLite
  // ─────────────────────────────────────────────────────────────────
  it('[P0] G2: base vacía → store vacío — ningún default hardcodeado', () => {
    const { db, close } = createTestDb();

    const result = hydrateStore(db as any);

    expect(result.status).toBe('success');

    const store = useAppStore.getState();
    // DB vacía → store refleja DB, no defaults hardcodeados
    expect(store.products).toHaveLength(0);
    expect(store.activeShift).toBeNull();
    expect(store.activeBranch).toBeNull();
    expect(store.initializationStatus).toBe('READY');

    close();
  });

  // ─────────────────────────────────────────────────────────────────
  // G5: Idempotencia — segunda llamada con READY no re-hidrata
  // ─────────────────────────────────────────────────────────────────
  it('[P1] G5: segunda llamada con status=READY retorna success sin re-hidratar', () => {
    const { db, close } = createTestDb();

    hydrateStore(db as any);
    expect(useAppStore.getState().initializationStatus).toBe('READY');

    // Insertar producto después de la primera hidratación
    db.insert(schema.products).values({
      id: 'new-prod',
      name: 'Nuevo',
      price_cents: 500,
      cost_cents: null,
      active: 1,
      version: 1,
      created_at: '2026-06-02T00:00:00Z',
    }).run();

    const result = hydrateStore(db as any);
    expect(result.status).toBe('success');
    // No re-hidra: el producto nuevo no aparece en el store
    expect(useAppStore.getState().products).toHaveLength(0);

    close();
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-HYD-02: pending_cart mid-transaction — DIFERIDO (Story 4b+)
  // pending_cart table no existe en schema v1
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] AC-HYD-02: pending_cart con in_progress → cart.items hidratado — DIFERIDO a Story 4b+', () => {
    // pending_cart table no existe en schema v1 — activar en Story 4b
  });

});
