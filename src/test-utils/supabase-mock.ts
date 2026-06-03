type MockQueryBuilder = {
  select: jest.MockedFunction<() => MockQueryBuilder>;
  insert: jest.MockedFunction<(data: unknown) => MockQueryBuilder>;
  update: jest.MockedFunction<(data: unknown) => MockQueryBuilder>;
  delete: jest.MockedFunction<() => MockQueryBuilder>;
  eq: jest.MockedFunction<(column: string, value: unknown) => MockQueryBuilder>;
  gt: jest.MockedFunction<(column: string, value: unknown) => MockQueryBuilder>;
  single: jest.MockedFunction<() => MockQueryBuilder>;
  data: unknown[] | null;
  error: null;
};

function createMockQueryBuilder(data: unknown[] = []): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: jest.fn((): MockQueryBuilder => builder),
    insert: jest.fn((_data: unknown): MockQueryBuilder => builder),
    update: jest.fn((_data: unknown): MockQueryBuilder => builder),
    delete: jest.fn((): MockQueryBuilder => builder),
    eq: jest.fn((_column: string, _value: unknown): MockQueryBuilder => builder),
    gt: jest.fn((_column: string, _value: unknown): MockQueryBuilder => builder),
    single: jest.fn((): MockQueryBuilder => builder),
    data,
    error: null,
  };
  return builder;
}

export function createSupabaseMock(defaultData: unknown[] = []) {
  const fromMock = jest.fn(() => createMockQueryBuilder(defaultData));

  return {
    from: fromMock,
    auth: {
      setSession: jest.fn(),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    _fromMock: fromMock,
  };
}
