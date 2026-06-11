import { ReorderProductsUseCase } from '../ReorderProductsUseCase';
import type { Product } from '../../../domain/entities/Product';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';

jest.mock('expo-crypto', () => ({
  randomUUID: jest
    .fn()
    .mockReturnValueOnce('uuid-reorder-1')
    .mockReturnValueOnce('uuid-reorder-2'),
}));
jest.mock('../../../infrastructure/db/client', () => ({
  db: { insert: jest.fn() },
}));

function makeProduct(id: string, name = 'P'): Product {
  return {
    id,
    name,
    priceCents: 1000,
    costCents: null,
    active: true,
    version: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeMockRepo(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    findAllActive: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
    deactivate: jest.fn().mockResolvedValue(undefined),
    hasOpenNoteItems: jest.fn().mockResolvedValue(false),
    saveBranchSort: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeDb() {
  const run = jest.fn();
  const values = jest.fn().mockReturnValue({ run });
  const insert = jest.fn().mockReturnValue({ values });
  return { db: { insert }, insert, values, run } as const;
}

describe('ReorderProductsUseCase', () => {
  const products = [makeProduct('a'), makeProduct('b'), makeProduct('c')];

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lanza branch_required si branchId está vacío', async () => {
    const repo = makeMockRepo();
    const { db } = makeDb();
    const useCase = new ReorderProductsUseCase(repo, db as never);

    await expect(useCase.execute('', products, 'a', 'down')).rejects.toThrow('branch_required');
  });

  it('lanza product_not_in_list si productId no existe en el array', async () => {
    const repo = makeMockRepo();
    const { db } = makeDb();
    const useCase = new ReorderProductsUseCase(repo, db as never);

    await expect(useCase.execute('branch-1', products, 'z', 'up')).rejects.toThrow('product_not_in_list');
  });

  it('lanza already_first si intenta mover arriba el primero', async () => {
    const repo = makeMockRepo();
    const { db } = makeDb();
    const useCase = new ReorderProductsUseCase(repo, db as never);

    await expect(useCase.execute('branch-1', products, 'a', 'up')).rejects.toThrow('already_first');
  });

  it('lanza already_last si intenta mover abajo el último', async () => {
    const repo = makeMockRepo();
    const { db } = makeDb();
    const useCase = new ReorderProductsUseCase(repo, db as never);

    await expect(useCase.execute('branch-1', products, 'c', 'down')).rejects.toThrow('already_last');
  });

  it('mover arriba llama saveBranchSort con todos los entries y encola outbox para los dos productos intercambiados', async () => {
    const repo = makeMockRepo();
    const { db, insert, values, run } = makeDb();
    const useCase = new ReorderProductsUseCase(repo, db as never);

    const result = await useCase.execute('branch-1', products, 'b', 'up');

    expect(result.map((product) => product.id)).toEqual(['b', 'a', 'c']);
    expect(repo.saveBranchSort).toHaveBeenCalledWith('branch-1', [
      { productId: 'b', sortOrder: 1 },
      { productId: 'a', sortOrder: 2 },
      { productId: 'c', sortOrder: 3 },
    ]);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(values).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        entity_type: 'branch_sort',
        entity_id: 'branch-1',
        operation: 'UPDATE',
        idempotency_key: 'branch-sort-branch-1-b-pos1',
        payload: JSON.stringify({ branchId: 'branch-1', productId: 'b', sortOrder: 1 }),
      }),
    );
    expect(values).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        entity_type: 'branch_sort',
        entity_id: 'branch-1',
        operation: 'UPDATE',
        idempotency_key: 'branch-sort-branch-1-a-pos2',
        payload: JSON.stringify({ branchId: 'branch-1', productId: 'a', sortOrder: 2 }),
      }),
    );
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('mover abajo llama saveBranchSort con todos los entries y encola outbox para los dos productos intercambiados', async () => {
    const repo = makeMockRepo();
    const { db, insert, values, run } = makeDb();
    const useCase = new ReorderProductsUseCase(repo, db as never);

    const result = await useCase.execute('branch-1', products, 'b', 'down');

    expect(result.map((product) => product.id)).toEqual(['a', 'c', 'b']);
    expect(repo.saveBranchSort).toHaveBeenCalledWith('branch-1', [
      { productId: 'a', sortOrder: 1 },
      { productId: 'c', sortOrder: 2 },
      { productId: 'b', sortOrder: 3 },
    ]);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(values).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        idempotency_key: 'branch-sort-branch-1-b-pos3',
        payload: JSON.stringify({ branchId: 'branch-1', productId: 'b', sortOrder: 3 }),
      }),
    );
    expect(values).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        idempotency_key: 'branch-sort-branch-1-c-pos2',
        payload: JSON.stringify({ branchId: 'branch-1', productId: 'c', sortOrder: 2 }),
      }),
    );
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('retorna array reordenado con posiciones correctas para una lista de 2 productos', async () => {
    const repo = makeMockRepo();
    const { db } = makeDb();
    const useCase = new ReorderProductsUseCase(repo, db as never);

    const result = await useCase.execute('branch-1', [makeProduct('x'), makeProduct('y')], 'x', 'down');

    expect(result.map((product) => product.id)).toEqual(['y', 'x']);
  });
});
