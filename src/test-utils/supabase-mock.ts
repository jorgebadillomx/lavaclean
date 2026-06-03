type PostgrestError = { message: string; code: string; details: string };

type MockQueryBuilder = {
  select: jest.MockedFunction<() => MockQueryBuilder>;
  insert: jest.MockedFunction<(data: unknown) => MockQueryBuilder>;
  update: jest.MockedFunction<(data: unknown) => MockQueryBuilder>;
  delete: jest.MockedFunction<() => MockQueryBuilder>;
  eq: jest.MockedFunction<(column: string, value: unknown) => MockQueryBuilder>;
  gt: jest.MockedFunction<(column: string, value: unknown) => MockQueryBuilder>;
  single: jest.MockedFunction<() => MockQueryBuilder>;
  data: unknown[] | null;
  error: PostgrestError | null;
};

function createMockQueryBuilder(
  data: unknown[] = [],
  error: PostgrestError | null = null,
): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: jest.fn((): MockQueryBuilder => builder),
    insert: jest.fn((_data: unknown): MockQueryBuilder => builder),
    update: jest.fn((_data: unknown): MockQueryBuilder => builder),
    delete: jest.fn((): MockQueryBuilder => builder),
    eq: jest.fn((_column: string, _value: unknown): MockQueryBuilder => builder),
    gt: jest.fn((_column: string, _value: unknown): MockQueryBuilder => builder),
    single: jest.fn((): MockQueryBuilder => builder),
    data,
    error,
  };
  return builder;
}

export function createSupabaseMock(
  defaultData: unknown[] = [],
  defaultError: PostgrestError | null = null,
) {
  const fromMock = jest.fn(() => createMockQueryBuilder(defaultData, defaultError));

  return {
    from: fromMock,
    auth: {
      setSession: jest.fn(),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    _fromMock: fromMock,
  };
}
