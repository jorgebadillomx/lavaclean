import { faker } from '@faker-js/faker';

export type SmokeScenario = {
  appName: string;
  subtitle: string;
  baseUrl: string;
  operator: TestOperator;
};

export type TestOperator = {
  id: string;
  name: string;
  email: string;
  role: 'cashier' | 'admin' | 'supervisor';
  active: boolean;
};

export type BranchSeed = {
  id: string;
  name: string;
  footerMessage: string;
  createdAt: string;
};

export type ProductSeed = {
  id: string;
  name: string;
  priceCents: number;
  costCents: number | null;
  active: boolean;
  version: number;
  createdAt: string;
};

export function createTestOperator(overrides: Partial<TestOperator> = {}): TestOperator {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'lavaclean.test' }),
    role: 'cashier',
    active: true,
    ...overrides,
  };
}

export function createSmokeScenario(overrides: Partial<SmokeScenario> = {}): SmokeScenario {
  return {
    appName: 'LavaClean',
    subtitle: 'Sistema de Punto de Venta',
    baseUrl: '/',
    operator: createTestOperator(),
    ...overrides,
  };
}

export function createBranchSeed(overrides: Partial<BranchSeed> = {}): BranchSeed {
  return {
    id: faker.string.uuid(),
    name: `Sucursal ${faker.location.city()}`,
    footerMessage: 'Servicio de lavandería',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createProductSeed(overrides: Partial<ProductSeed> = {}): ProductSeed {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    priceCents: faker.number.int({ min: 5_000, max: 30_000 }),
    costCents: faker.number.int({ min: 1_000, max: 20_000 }),
    active: true,
    version: 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
