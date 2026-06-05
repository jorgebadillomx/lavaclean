/* eslint-disable import/first */
jest.unmock('drizzle-orm/expo-sqlite');
import { expoSQLiteMock as mockExpoSQLiteMock } from '../../../test-utils/expoSQLiteMock';

jest.mock('expo-sqlite', () => mockExpoSQLiteMock());

import { createTestDb } from '../../../test-utils/db-test-utils';
import * as schema from '../../db/schema';
import { ProductRepository } from '../ProductRepository';

const BRANCH_ID = 'branch-1';
const NOW = '2026-01-01T00:00:00.000Z';

function insertBranch(testDb: ReturnType<typeof createTestDb>['db']) {
  testDb
    .insert(schema.branches)
    .values({ id: BRANCH_ID, name: 'Test Branch', footer_message: null, created_at: NOW })
    .run();
}

describe('ProductRepository', () => {
  const { db: testDb, close } = createTestDb();

  beforeEach(() => {
    testDb.delete(schema.branch_sort).run();
    testDb.delete(schema.products).run();
    testDb.delete(schema.branches).run();
  });

  afterAll(() => {
    close();
  });

  it('retorna productos activos ordenados por sort_order del branch', async () => {
    insertBranch(testDb);
    testDb.insert(schema.products).values([
      { id: 'prod-a', name: 'Lavado Normal', price_cents: 8000, active: 1, version: 1, created_at: '2026-01-01T00:00:00.000Z' },
      { id: 'prod-b', name: 'Lavado Completo', price_cents: 12000, active: 1, version: 1, created_at: '2026-01-02T00:00:00.000Z' },
      { id: 'prod-c', name: 'Encerado', price_cents: 15000, active: 1, version: 1, created_at: '2026-01-03T00:00:00.000Z' },
    ]).run();
    testDb.insert(schema.branch_sort).values([
      { branch_id: BRANCH_ID, product_id: 'prod-a', sort_order: 2 },
      { branch_id: BRANCH_ID, product_id: 'prod-b', sort_order: 1 },
      { branch_id: BRANCH_ID, product_id: 'prod-c', sort_order: 3 },
    ]).run();

    const repo = new ProductRepository(testDb as never);
    const result = await repo.findAllActive(BRANCH_ID);

    expect(result.map((p) => p.id)).toEqual(['prod-b', 'prod-a', 'prod-c']);
  });

  it('retorna todos los activos sin branch_sort, ordenados por created_at', async () => {
    insertBranch(testDb);
    testDb.insert(schema.products).values([
      { id: 'prod-a', name: 'Lavado Normal', price_cents: 8000, active: 1, version: 1, created_at: '2026-01-03T00:00:00.000Z' },
      { id: 'prod-b', name: 'Lavado Completo', price_cents: 12000, active: 1, version: 1, created_at: '2026-01-01T00:00:00.000Z' },
      { id: 'prod-c', name: 'Encerado', price_cents: 15000, active: 1, version: 1, created_at: '2026-01-02T00:00:00.000Z' },
    ]).run();

    const repo = new ProductRepository(testDb as never);
    const result = await repo.findAllActive(BRANCH_ID);

    expect(result.map((p) => p.id)).toEqual(['prod-b', 'prod-c', 'prod-a']);
  });

  it('retorna solo productos activos ignorando los inactivos', async () => {
    testDb.insert(schema.products).values([
      { id: 'prod-active', name: 'Activo', price_cents: 5000, active: 1, version: 1, created_at: NOW },
      { id: 'prod-inactive', name: 'Inactivo', price_cents: 7000, active: 0, version: 1, created_at: NOW },
    ]).run();

    const repo = new ProductRepository(testDb as never);
    const result = await repo.findAllActive(null);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('prod-active');
    expect(result[0].active).toBe(true);
  });

  it('branchId null retorna todos los activos sin sort de branch, ordenados por created_at', async () => {
    testDb.insert(schema.products).values([
      { id: 'prod-a', name: 'Lavado Normal', price_cents: 8000, active: 1, version: 1, created_at: '2026-01-02T00:00:00.000Z' },
      { id: 'prod-b', name: 'Lavado Completo', price_cents: 12000, active: 1, version: 1, created_at: '2026-01-01T00:00:00.000Z' },
    ]).run();

    const repo = new ProductRepository(testDb as never);
    const result = await repo.findAllActive(null);

    expect(result.map((p) => p.id)).toEqual(['prod-b', 'prod-a']);
  });

  it('mapea correctamente los campos de DB a la entidad de dominio', async () => {
    testDb.insert(schema.products).values({
      id: 'prod-1',
      name: 'Servicio de prueba',
      price_cents: 9900,
      cost_cents: 4500,
      active: 1,
      version: 2,
      created_at: '2026-06-01T10:00:00.000Z',
    }).run();

    const repo = new ProductRepository(testDb as never);
    const [product] = await repo.findAllActive(null);

    expect(product).toEqual({
      id: 'prod-1',
      name: 'Servicio de prueba',
      priceCents: 9900,
      costCents: 4500,
      active: true,
      version: 2,
      createdAt: '2026-06-01T10:00:00.000Z',
    });
  });
});
