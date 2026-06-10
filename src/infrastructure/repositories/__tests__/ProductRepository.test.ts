/* eslint-disable import/first */
jest.unmock('drizzle-orm/expo-sqlite');
import { expoSQLiteMock as mockExpoSQLiteMock } from '../../../test-utils/expoSQLiteMock';

jest.mock('expo-sqlite', () => mockExpoSQLiteMock());

import { createTestDb } from '../../../test-utils/db-test-utils';
import * as schema from '../../db/schema';
import { ProductRepository } from '../ProductRepository';

const BRANCH_ID = 'branch-1';
const SHIFT_ID = 'shift-1';
const NOTE_ID = 'note-1';
const PROD_ID = 'prod-deactivate';
const NOW = '2026-01-01T00:00:00.000Z';

function insertBranch(testDb: ReturnType<typeof createTestDb>['db']) {
  testDb
    .insert(schema.branches)
    .values({ id: BRANCH_ID, name: 'Test Branch', footer_message: null, created_at: NOW })
    .run();
}

function insertShift(testDb: ReturnType<typeof createTestDb>['db']) {
  testDb.insert(schema.shifts).values({
    id: SHIFT_ID,
    branch_id: BRANCH_ID,
    operator_name: 'Test',
    status: 'open',
    opened_at: NOW,
  }).run();
}

function insertNote(
  testDb: ReturnType<typeof createTestDb>['db'],
  status: 'open' | 'closed' | 'cancelled' = 'open',
) {
  testDb.insert(schema.notes).values({
    id: NOTE_ID,
    shift_id: SHIFT_ID,
    customer_alias: 'Cliente',
    status,
    created_at: NOW,
  }).run();
}

function insertNoteItem(testDb: ReturnType<typeof createTestDb>['db']) {
  testDb.insert(schema.note_items).values({
    id: 'item-1',
    note_id: NOTE_ID,
    product_id: PROD_ID,
    product_name_snapshot: 'Producto Test',
    unit_price_cents: 5000,
    quantity: 1,
  }).run();
}

describe('ProductRepository', () => {
  const { db: testDb, close } = createTestDb();

  beforeEach(() => {
    testDb.delete(schema.note_items).run();
    testDb.delete(schema.notes).run();
    testDb.delete(schema.cash_movements).run();
    testDb.delete(schema.shifts).run();
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

  it('save() inserta un nuevo producto y findAllActive() lo retorna', async () => {
    const repo = new ProductRepository(testDb as never);
    const product = {
      id: 'prod-new',
      name: 'Nuevo Servicio',
      priceCents: 5500,
      costCents: null,
      active: true,
      version: 1,
      createdAt: NOW,
    };

    await repo.save(product);
    const all = await repo.findAllActive(null);

    expect(all.find((item) => item.id === product.id)).toEqual(product);
  });

  it('findById() retorna el producto mapeado a camelCase', async () => {
    testDb.insert(schema.products).values({
      id: 'prod-find',
      name: 'Servicio encontrado',
      price_cents: 12300,
      cost_cents: 4500,
      active: 1,
      version: 2,
      created_at: NOW,
    }).run();

    const repo = new ProductRepository(testDb as never);
    const result = await repo.findById('prod-find');

    expect(result).toEqual({
      id: 'prod-find',
      name: 'Servicio encontrado',
      priceCents: 12300,
      costCents: 4500,
      active: true,
      version: 2,
      createdAt: NOW,
    });
  });

  it('findById() retorna null para un ID inexistente', async () => {
    const repo = new ProductRepository(testDb as never);

    await expect(repo.findById('missing-id')).resolves.toBeNull();
  });

  it('save() actualiza nombre, precio y versión sin cambiar created_at', async () => {
    const repo = new ProductRepository(testDb as never);

    await repo.save({
      id: 'prod-edit',
      name: 'Versión inicial',
      priceCents: 8000,
      costCents: 3000,
      active: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    await repo.save({
      id: 'prod-edit',
      name: 'Versión editada',
      priceCents: 9100,
      costCents: null,
      active: true,
      version: 2,
      createdAt: '2026-12-31T23:59:59.000Z',
    });

    const product = await repo.findById('prod-edit');

    expect(product).toEqual({
      id: 'prod-edit',
      name: 'Versión editada',
      priceCents: 9100,
      costCents: null,
      active: true,
      version: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('save() conserva costCents null', async () => {
    const repo = new ProductRepository(testDb as never);

    await repo.save({
      id: 'prod-null-cost',
      name: 'Sin costo',
      priceCents: 7000,
      costCents: null,
      active: true,
      version: 1,
      createdAt: NOW,
    });

    const product = await repo.findById('prod-null-cost');

    expect(product?.costCents).toBeNull();
  });

  it('deactivate() desactiva un producto activo, incrementa versión y lo oculta en findAllActive()', async () => {
    testDb.insert(schema.products).values({
      id: PROD_ID,
      name: 'Producto a desactivar',
      price_cents: 5000,
      cost_cents: 2000,
      active: 1,
      version: 3,
      created_at: NOW,
    }).run();

    const repo = new ProductRepository(testDb as never);

    await repo.deactivate(PROD_ID);

    await expect(repo.findAllActive(null)).resolves.toEqual([]);
    await expect(repo.findById(PROD_ID)).resolves.toEqual({
      id: PROD_ID,
      name: 'Producto a desactivar',
      priceCents: 5000,
      costCents: 2000,
      active: false,
      version: 4,
      createdAt: NOW,
    });
  });

  it('deactivate() no lanza cuando el producto no existe', async () => {
    const repo = new ProductRepository(testDb as never);

    await expect(repo.deactivate('missing-id')).resolves.toBeUndefined();
  });

  it('hasOpenNoteItems() retorna false cuando no hay notas abiertas', async () => {
    testDb.insert(schema.products).values({
      id: PROD_ID,
      name: 'Producto Test',
      price_cents: 5000,
      cost_cents: null,
      active: 1,
      version: 1,
      created_at: NOW,
    }).run();

    const repo = new ProductRepository(testDb as never);

    await expect(repo.hasOpenNoteItems(PROD_ID)).resolves.toBe(false);
  });

  it('hasOpenNoteItems() retorna true cuando existe una nota open con el producto', async () => {
    insertBranch(testDb);
    testDb.insert(schema.products).values({
      id: PROD_ID,
      name: 'Producto Test',
      price_cents: 5000,
      cost_cents: null,
      active: 1,
      version: 1,
      created_at: NOW,
    }).run();
    insertShift(testDb);
    insertNote(testDb, 'open');
    insertNoteItem(testDb);

    const repo = new ProductRepository(testDb as never);

    await expect(repo.hasOpenNoteItems(PROD_ID)).resolves.toBe(true);
  });

  it('hasOpenNoteItems() retorna false para notas closed o cancelled', async () => {
    insertBranch(testDb);
    testDb.insert(schema.products).values({
      id: PROD_ID,
      name: 'Producto Test',
      price_cents: 5000,
      cost_cents: null,
      active: 1,
      version: 1,
      created_at: NOW,
    }).run();
    insertShift(testDb);
    insertNote(testDb, 'closed');
    insertNoteItem(testDb);

    const repo = new ProductRepository(testDb as never);

    await expect(repo.hasOpenNoteItems(PROD_ID)).resolves.toBe(false);

    testDb.delete(schema.note_items).run();
    testDb.delete(schema.notes).run();
    insertNote(testDb, 'cancelled');
    insertNoteItem(testDb);

    await expect(repo.hasOpenNoteItems(PROD_ID)).resolves.toBe(false);
  });
});
