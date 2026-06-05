import { hydrateIfNeeded } from '../InitialHydration';

type QueryResult<T> = {
  data: T[] | null;
  error: unknown | null;
  select: jest.Mock;
  eq: jest.Mock;
};

function makeQueryResult<T>(data: T[] | null, error: unknown | null = null): QueryResult<T> {
  const result: Partial<QueryResult<T>> & { data: T[] | null; error: unknown | null } = {
    data,
    error,
    select: jest.fn(),
    eq: jest.fn(),
  };

  result.select = jest.fn(() => result);
  result.eq = jest.fn(() => result);

  return result as QueryResult<T>;
}

function makeRawDbMock(lastHydratedAt: string | null) {
  const runSync = jest.fn();
  const withTransactionSync = jest.fn((fn: () => void) => {
    fn();
  });

  return {
    getFirstSync: jest.fn(() => (lastHydratedAt === null ? null : { value: lastHydratedAt })),
    runSync,
    withTransactionSync,
  };
}

describe('InitialHydration', () => {
  it('AC-HYD-01: hidrata sucursales y productos en una transacción y escribe last_hydrated_at', async () => {
    const rawDb = makeRawDbMock(null);
    const branches = [
      {
        id: 'branch-1',
        name: 'Sucursal Centro',
        footer_message: 'Gracias por su preferencia',
        created_at: '2026-06-05T00:00:00.000Z',
      },
    ];
    const products = [
      {
        id: 'product-1',
        name: 'Detergente',
        price_cents: 2500,
        cost_cents: 1200,
        active: true,
        version: 3,
        created_at: '2026-06-05T00:00:00.000Z',
      },
    ];

    const branchesQuery = makeQueryResult(branches);
    const productsQuery = makeQueryResult(products);
    const from = jest.fn((table: string) => {
      if (table === 'branches') return branchesQuery;
      if (table === 'products') return productsQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await hydrateIfNeeded(rawDb as never, { from } as never);

    expect(result).toEqual({ status: 'Success' });
    expect(from).toHaveBeenCalledWith('branches');
    expect(from).toHaveBeenCalledWith('products');
    expect(branchesQuery.select).toHaveBeenCalledWith('id, name, footer_message, created_at');
    expect(productsQuery.select).toHaveBeenCalledWith('id, name, price_cents, cost_cents, active, version, created_at');
    expect(productsQuery.eq).toHaveBeenCalledWith('active', true);
    expect(rawDb.withTransactionSync).toHaveBeenCalledTimes(1);
    expect(rawDb.runSync).toHaveBeenCalledTimes(3);
    expect(rawDb.runSync.mock.calls.map(([sql]) => sql)).toEqual([
      'INSERT OR REPLACE INTO branches (id, name, footer_message, created_at) VALUES (?, ?, ?, ?)',
      'INSERT OR REPLACE INTO products (id, name, price_cents, cost_cents, active, version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      "INSERT OR REPLACE INTO _meta (key, value) VALUES ('last_hydrated_at', ?)",
    ]);
    expect(rawDb.runSync.mock.calls[0][1]).toEqual([
      'branch-1',
      'Sucursal Centro',
      'Gracias por su preferencia',
      '2026-06-05T00:00:00.000Z',
    ]);
    expect(rawDb.runSync.mock.calls[1][1]).toEqual([
      'product-1',
      'Detergente',
      2500,
      1200,
      1,
      3,
      '2026-06-05T00:00:00.000Z',
    ]);
    expect(rawDb.runSync.mock.calls[2][1][0]).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));
  });

  it('AC-HYD-02: devuelve Skipped y no llama a Supabase cuando ya existe last_hydrated_at', async () => {
    const rawDb = makeRawDbMock('2026-06-05T00:00:00.000Z');
    const from = jest.fn();

    const result = await hydrateIfNeeded(rawDb as never, { from } as never);

    expect(result).toEqual({ status: 'Skipped' });
    expect(from).not.toHaveBeenCalled();
    expect(rawDb.withTransactionSync).not.toHaveBeenCalled();
    expect(rawDb.runSync).not.toHaveBeenCalled();
  });

  it('AC-HYD-03: devuelve Failure con reason offline si Supabase lanza error y no abre transacción', async () => {
    const rawDb = makeRawDbMock(null);
    const offlineError = new Error('Network request failed');
    const from = jest.fn((table: string) => {
      if (table === 'branches') {
        return {
          select: jest.fn(() => {
            throw offlineError;
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await hydrateIfNeeded(rawDb as never, { from } as never);

    expect(result).toEqual({ status: 'Failure', reason: 'offline' });
    expect(from).toHaveBeenCalledTimes(1);
    expect(rawDb.withTransactionSync).not.toHaveBeenCalled();
    expect(rawDb.runSync).not.toHaveBeenCalled();
  });

  it('devuelve Failure cuando Supabase retorna una lista vacía de sucursales', async () => {
    const rawDb = makeRawDbMock(null);
    const branchesQuery = makeQueryResult([]);
    const productsQuery = makeQueryResult([]);
    const from = jest.fn((table: string) => {
      if (table === 'branches') return branchesQuery;
      if (table === 'products') return productsQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await hydrateIfNeeded(rawDb as never, { from } as never);

    expect(result).toEqual({ status: 'Failure', reason: 'empty_branches' });
    expect(rawDb.withTransactionSync).not.toHaveBeenCalled();
    expect(rawDb.runSync).not.toHaveBeenCalled();
  });

  it('devuelve Failure cuando Supabase retorna sucursales pero productos vacíos', async () => {
    const rawDb = makeRawDbMock(null);
    const branchesQuery = makeQueryResult([
      { id: 'branch-1', name: 'Sucursal Centro', footer_message: null, created_at: '2026-06-05T00:00:00.000Z' },
    ]);
    const productsQuery = makeQueryResult([]);
    const from = jest.fn((table: string) => {
      if (table === 'branches') return branchesQuery;
      if (table === 'products') return productsQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await hydrateIfNeeded(rawDb as never, { from } as never);

    expect(result).toEqual({ status: 'Failure', reason: 'empty_products' });
    expect(rawDb.withTransactionSync).not.toHaveBeenCalled();
    expect(rawDb.runSync).not.toHaveBeenCalled();
  });
});
