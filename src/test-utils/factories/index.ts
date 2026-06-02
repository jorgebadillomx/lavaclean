/**
 * Test factories for Punto Lavandería
 *
 * PRE-SPRINT-0 SCAFFOLD — place this file at src/test-utils/factories/index.ts
 * once the project is scaffolded with `npx create-expo-app@latest`.
 *
 * Requires: @faker-js/faker (install in Sprint 0)
 *   npm install --save-dev @faker-js/faker
 */

// NOTE: Import faker once installed. For now, we provide UUID-based stubs.
// import { faker } from '@faker-js/faker';

let _counter = 0;
const uid = () => `test-${++_counter}-${Date.now()}`;

// ─────────────────────────────────────────────
// Domain Types (mirrors src/domain/entities/)
// ─────────────────────────────────────────────

export type Branch = {
  id: string;
  name: string;
  footerMessage: string | null;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  priceCents: number;
  costCents: number | null;
  active: boolean;
  version: number;
  createdAt: string;
};

export type Shift = {
  id: string;
  branchId: string;
  operatorName: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
  initialBillsCents: number;
  initialCoinsCents: number;
  finalBillsCents: number | null;
  finalCoinsCents: number | null;
};

export type Note = {
  id: string;
  shiftId: string;
  customerAlias: string;
  status: 'open' | 'closed' | 'cancelled';
  cancelledReason: string | null;
  createdAt: string;
  closedAt: string | null;
  paymentMethod: 'cash' | 'card' | 'transfer' | null;
  amountReceivedCents: number | null;
  changeCents: number | null;
  ticketPayload: string | null;
};

export type NoteItem = {
  id: string;
  noteId: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
};

// ─────────────────────────────────────────────
// Factories
// ─────────────────────────────────────────────

export const BranchFactory = {
  create: (overrides: Partial<Branch> = {}): Branch => ({
    id: uid(),
    name: `Sucursal Test ${uid()}`,
    footerMessage: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
};

export const ProductFactory = {
  create: (overrides: Partial<Product> = {}): Product => ({
    id: uid(),
    name: `Servicio Test ${uid()}`,
    priceCents: 5000, // $50.00
    costCents: null,
    active: true,
    version: 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
};

export const ShiftFactory = {
  create: (overrides: Partial<Shift> = {}): Shift => ({
    id: uid(),
    branchId: uid(),
    operatorName: 'Operador Test',
    status: 'open',
    openedAt: new Date().toISOString(),
    closedAt: null,
    initialBillsCents: 50000, // $500.00 en billetes
    initialCoinsCents: 5000,  // $50.00 en monedas
    finalBillsCents: null,
    finalCoinsCents: null,
    ...overrides,
  }),
};

export const NoteFactory = {
  create: (overrides: Partial<Note> = {}): Note => ({
    id: uid(),
    shiftId: uid(),
    customerAlias: 'Lupita',
    status: 'open',
    cancelledReason: null,
    createdAt: new Date().toISOString(),
    closedAt: null,
    paymentMethod: null,
    amountReceivedCents: null,
    changeCents: null,
    ticketPayload: null,
    ...overrides,
  }),
};

export const NoteItemFactory = {
  create: (overrides: Partial<NoteItem> = {}): NoteItem => ({
    id: uid(),
    noteId: uid(),
    productId: uid(),
    productNameSnapshot: 'Lavado Normal',
    unitPriceCents: 8000, // $80.00
    quantity: 1,
    ...overrides,
  }),
};
