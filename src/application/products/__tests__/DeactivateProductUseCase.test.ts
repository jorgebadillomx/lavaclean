import { DeactivateProductUseCase } from '../DeactivateProductUseCase';
import type { Product } from '../../../domain/entities/Product';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-uuid-deactivate' }));
jest.mock('../../../infrastructure/db/client', () => ({
  db: { insert: jest.fn() },
}));

const activeProduct: Product = {
  id: 'prod-1',
  name: 'Servicio',
  priceCents: 5000,
  costCents: null,
  active: true,
  version: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function makeMockRepo(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    findAllActive: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(activeProduct),
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

describe('DeactivateProductUseCase', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lanza product_not_found si el producto no existe', async () => {
    const repo = makeMockRepo({ findById: jest.fn().mockResolvedValue(null) });
    const { db } = makeDb();
    const useCase = new DeactivateProductUseCase(repo, db as never);

    await expect(useCase.execute('missing-id')).rejects.toThrow('product_not_found');
  });

  it('lanza product_already_inactive si el producto ya está inactivo', async () => {
    const repo = makeMockRepo({
      findById: jest.fn().mockResolvedValue({ ...activeProduct, active: false }),
    });
    const { db } = makeDb();
    const useCase = new DeactivateProductUseCase(repo, db as never);

    await expect(useCase.execute(activeProduct.id)).rejects.toThrow('product_already_inactive');
  });

  it('desactiva el producto y encola outbox con active false', async () => {
    const repo = makeMockRepo();
    const { db, insert, values, run } = makeDb();
    const useCase = new DeactivateProductUseCase(repo, db as never);

    await useCase.execute(activeProduct.id);

    expect(repo.findById).toHaveBeenCalledWith(activeProduct.id);
    expect(repo.deactivate).toHaveBeenCalledWith(activeProduct.id);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'product',
        entity_id: activeProduct.id,
        operation: 'UPDATE',
        idempotency_key: `product-deactivate-${activeProduct.id}`,
      }),
    );
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: JSON.stringify({
          ...activeProduct,
          active: false,
          version: activeProduct.version + 1,
        }),
      }),
    );
    expect(run).toHaveBeenCalledTimes(1);
  });
});
