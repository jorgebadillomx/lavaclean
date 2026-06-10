import { SaveProductUseCase } from '../SaveProductUseCase';
import type { Product } from '../../../domain/entities/Product';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-test-1234'),
}));
jest.mock('../../../infrastructure/db/client', () => ({
  db: { insert: jest.fn() },
}));

const existingProduct: Product = {
  id: 'prod-1',
  name: 'Servicio',
  priceCents: 5000,
  costCents: null,
  active: true,
  version: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function makeRepo() {
  return {
    findAllActive: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(existingProduct),
    save: jest.fn().mockResolvedValue(undefined),
    deactivate: jest.fn().mockResolvedValue(undefined),
    hasOpenNoteItems: jest.fn().mockResolvedValue(false),
  } satisfies IProductRepository;
}

function makeDb() {
  const run = jest.fn();
  const values = jest.fn().mockReturnValue({ run });
  const insert = jest.fn().mockReturnValue({ values });
  return { db: { insert }, insert, values, run } as const;
}

describe('SaveProductUseCase', () => {
  it('lanza error si el nombre está vacío', async () => {
    const repo = makeRepo();
    const { db } = makeDb();
    const useCase = new SaveProductUseCase(repo, db as never);

    await expect(useCase.execute({ name: '', priceCents: 1000, costCents: null }))
      .rejects.toThrow('validation_failed');
  });

  it('lanza error si priceCents es 0', async () => {
    const repo = makeRepo();
    const { db } = makeDb();
    const useCase = new SaveProductUseCase(repo, db as never);

    await expect(useCase.execute({ name: 'Test', priceCents: 0, costCents: null }))
      .rejects.toThrow('validation_failed');
  });

  it('lanza error si priceCents es negativo', async () => {
    const repo = makeRepo();
    const { db } = makeDb();
    const useCase = new SaveProductUseCase(repo, db as never);

    await expect(useCase.execute({ name: 'Test', priceCents: -100, costCents: null }))
      .rejects.toThrow('validation_failed');
  });

  it('lanza error si costCents es negativo', async () => {
    const repo = makeRepo();
    const { db } = makeDb();
    const useCase = new SaveProductUseCase(repo, db as never);

    await expect(useCase.execute({ name: 'Test', priceCents: 1000, costCents: -50 }))
      .rejects.toThrow('validation_failed');
  });

  it('lanza error al editar un producto que no existe en la DB', async () => {
    const repo = makeRepo();
    repo.findById = jest.fn().mockResolvedValue(null);
    const { db } = makeDb();
    const useCase = new SaveProductUseCase(repo, db as never);

    await expect(useCase.execute({ id: 'no-existe', name: 'Test', priceCents: 1000, costCents: null }))
      .rejects.toThrow('product_not_found');
  });

  it('crea un producto nuevo sin id, genera UUID y encola outbox', async () => {
    const repo = makeRepo();
    const { db, insert, values, run } = makeDb();
    const useCase = new SaveProductUseCase(repo, db as never);

    const result = await useCase.execute({
      name: 'Nuevo Producto',
      priceCents: 12500,
      costCents: null,
    });

    expect(result.id).toBe('uuid-test-1234');
    expect(result.version).toBe(1);
    expect(repo.findById).not.toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect((repo.save as jest.Mock).mock.calls[0][0]).toMatchObject({
      id: 'uuid-test-1234',
      name: 'Nuevo Producto',
      priceCents: 12500,
      costCents: null,
      active: true,
      version: 1,
    });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'product',
        entity_id: 'uuid-test-1234',
        operation: 'INSERT',
        idempotency_key: 'product-uuid-test-1234-1',
      }),
    );
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('edita un producto existente, incrementa versión y preserva createdAt', async () => {
    const repo = makeRepo();
    const { db } = makeDb();
    const useCase = new SaveProductUseCase(repo, db as never);

    const result = await useCase.execute({
      id: existingProduct.id,
      name: 'Servicio Actualizado',
      priceCents: 6400,
      costCents: 3100,
    });

    expect(repo.findById).toHaveBeenCalledWith(existingProduct.id);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.version).toBe(4);
    expect((repo.save as jest.Mock).mock.calls[0][0]).toMatchObject({
      id: existingProduct.id,
      name: 'Servicio Actualizado',
      priceCents: 6400,
      costCents: 3100,
      active: true,
      version: 4,
      createdAt: existingProduct.createdAt,
    });
  });
});
