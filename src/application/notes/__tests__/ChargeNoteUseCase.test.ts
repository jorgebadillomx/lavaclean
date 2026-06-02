/**
 * ATDD Red-Phase Scaffolds — Story 4b.3: Cobrar Nota
 *
 * PRE-SPRINT-0 SCAFFOLD: Generado como artefacto de planificación.
 * Target path: src/application/notes/__tests__/ChargeNoteUseCase.test.ts
 *
 * TDD RED PHASE: Todos los tests están en it.skip().
 * Activar uno por uno durante la implementación de Story 4b.3.
 *
 * Revenue-critical — P0 en todos los escenarios de cobro.
 *
 * @group p0
 * @group revenue-critical
 * @group cobro
 */

/**
 * FIXTURE NEEDS (resolver en Sprint 0):
 *   - createTestDatabase() from 'src/test-utils/db-test-utils'
 *   - ChargeNoteUseCase from 'src/application/notes/ChargeNoteUseCase'
 *   - MockPrintingService implementing IPrintingService
 *   - NoteFactory, NoteItemFactory, ShiftFactory from 'src/test-utils/factories'
 *
 * BUSINESS INVARIANTS BAJO TEST:
 *   - BUS-001: Todos los montos en centavos enteros, NUNCA floats
 *   - NFR-4: Exactamente 1 transacción SQLite por cobro
 *   - NFR-6: Cobro completa aunque IPrintingService falle
 *   - ADR-005: Outbox encolado DESPUÉS de confirmar SQLite
 */

// ─── Imports (uncomment when Sprint 0 is complete) ───────────────────────────
//
// import { createTestDatabase } from '../../../test-utils/db-test-utils';
// import { ChargeNoteUseCase, ChargeNoteInput } from '../ChargeNoteUseCase';
// import { NoteFactory, NoteItemFactory, ShiftFactory } from '../../../test-utils/factories';
// import { MockPrintingService } from '../../../test-utils/MockPrintingService';
// import { schema } from '../../../infrastructure/db/schema';
// import { OutboxRepository } from '../../../infrastructure/repositories/OutboxRepository';
//
// ─────────────────────────────────────────────────────────────────────────────

describe('Story 4b.3 — ChargeNoteUseCase @P0 @Revenue-Critical', () => {

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-01: Total calculado en centavos enteros
  // BUS-001: NUNCA floats en cálculos de monto
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] BUS-001: total = sum(unitPriceCents × quantity) en enteros — SIN operaciones float', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // Setup
    // const db = await createTestDatabase();
    // const shift = ShiftFactory.create();
    // const note = NoteFactory.create({ shiftId: shift.id });
    //
    // Items: $80.00 × 2 = $160.00; $50.00 × 1 = $50.00; total = $210.00
    // const items = [
    //   NoteItemFactory.create({ noteId: note.id, unitPriceCents: 8000, quantity: 2 }),
    //   NoteItemFactory.create({ noteId: note.id, unitPriceCents: 5000, quantity: 1 }),
    // ];
    // await db.insert(schema.shifts).values(shift);
    // await db.insert(schema.notes).values(note);
    // await db.insert(schema.noteItems).values(items);
    //
    // Act
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    // const result = await useCase.execute({
    //   noteId: note.id,
    //   paymentMethod: 'cash',
    //   amountReceivedCents: 21000, // $210.00 exacto
    // });
    //
    // Assert: total correcto en centavos
    // expect(result.totalCents).toBe(21000);       // 8000×2 + 5000×1 = 21000
    // expect(result.changeCents).toBe(0);          // 21000 - 21000 = 0
    //
    // Assert BUS-001: SIN floats en ningún campo
    // expect(Number.isInteger(result.totalCents)).toBe(true);
    // expect(Number.isInteger(result.changeCents)).toBe(true);
    // expect(Number.isInteger(result.amountReceivedCents)).toBe(true);
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-02: Cambio calculado correctamente (entero)
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] Cambio = amountReceived - total (centavos enteros, sin float)', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // Setup: Nota con total $80.00, paga con $100.00
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 8000, quantity: 1 })];
    // // ... insert in DB
    //
    // Act
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    // const result = await useCase.execute({
    //   noteId: note.id,
    //   paymentMethod: 'cash',
    //   amountReceivedCents: 10000, // $100.00
    // });
    //
    // Assert: cambio = $20.00 = 2000 centavos
    // expect(result.changeCents).toBe(2000);
    // expect(Number.isInteger(result.changeCents)).toBe(true);
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-03: Monto recibido < total → ValidationError
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] amountReceived < total → lanza ValidationError, nota NO cambia estado', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // Setup: Nota con total $80.00, intenta pagar $50.00
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 8000, quantity: 1 })];
    // // ... insert in DB
    //
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    //
    // Act + Assert: debe lanzar ValidationError
    // await expect(useCase.execute({
    //   noteId: note.id,
    //   paymentMethod: 'cash',
    //   amountReceivedCents: 5000, // $50.00 < $80.00
    // })).rejects.toThrow('amount_insufficient');
    //
    // Assert: nota sigue abierta en DB
    // const noteInDb = await db.select().from(schema.notes).where(eq(schema.notes.id, note.id));
    // expect(noteInDb[0].status).toBe('open');
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-04: IPrintingService falla → cobro completa de todas formas
  // NFR-6: El flujo de cobro nunca se bloquea por fallo de impresión
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] NFR-6: IPrintingService lanza error → cobro completa, nota cerrada, toast no bloqueante', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 8000, quantity: 1 })];
    // // ... insert in DB
    //
    // Setup: MockPrintingService que SIEMPRE lanza error
    // const failingPrinter = new MockPrintingService();
    // failingPrinter.simulateError('RAWBT_NOT_INSTALLED');
    //
    // Act: cobro no debe lanzar aunque la impresora falle
    // const useCase = new ChargeNoteUseCase(db, failingPrinter);
    // const result = await expect(useCase.execute({
    //   noteId: note.id,
    //   paymentMethod: 'cash',
    //   amountReceivedCents: 8000,
    // })).resolves.not.toThrow();
    //
    // Assert: Nota fue cerrada correctamente a pesar del fallo de impresión
    // const noteInDb = await db.select().from(schema.notes).where(eq(schema.notes.id, note.id));
    // expect(noteInDb[0].status).toBe('closed');
    // expect(noteInDb[0].paymentMethod).toBe('cash');
    //
    // Assert: resultado contiene info del fallo de impresión (no bloqueante)
    // expect(result.printingError).toBe('RAWBT_NOT_INSTALLED');
    // expect(result.chargeCompleted).toBe(true);
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-05: Exactamente 1 transacción SQLite por cobro
  // NFR-4: Atomicidad — 1 sola txn
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] NFR-4: exactamente 1 transacción SQLite atómica por cobro', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 8000, quantity: 1 })];
    // // ... insert in DB
    //
    // Spy en db.transaction() para contar transacciones
    // let transactionCount = 0;
    // const originalTransaction = db.transaction.bind(db);
    // jest.spyOn(db, 'transaction').mockImplementation(async (fn) => {
    //   transactionCount++;
    //   return originalTransaction(fn);
    // });
    //
    // Act
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    // await useCase.execute({ noteId: note.id, paymentMethod: 'transfer', amountReceivedCents: 8000 });
    //
    // Assert: exactamente 1 transacción ejecutada
    // expect(transactionCount).toBe(1);
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-06: Nota pasa a status='closed' con todos los campos
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] Nota pasa a status=closed con paymentMethod, amountReceived, changeCents y closedAt', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 12000, quantity: 1 })]; // $120.00
    // // ... insert in DB
    //
    // const beforeCobro = new Date().toISOString();
    //
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    // await useCase.execute({
    //   noteId: note.id,
    //   paymentMethod: 'card',
    //   amountReceivedCents: 12000,
    // });
    //
    // const noteInDb = await db.select().from(schema.notes).where(eq(schema.notes.id, note.id));
    // const closedNote = noteInDb[0];
    //
    // expect(closedNote.status).toBe('closed');
    // expect(closedNote.paymentMethod).toBe('card');
    // expect(closedNote.amountReceivedCents).toBe(12000);
    // expect(closedNote.changeCents).toBe(0);
    // expect(closedNote.closedAt).not.toBeNull();
    // expect(closedNote.closedAt >= beforeCobro).toBe(true);
    //
    // Assert ADR-005: ticket_payload persistido
    // expect(closedNote.ticketPayload).not.toBeNull();
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-07: Outbox encolado DESPUÉS de confirmar SQLite
  // ADR-005: La regla del outbox
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] ADR-005: outbox encolado DESPUÉS de confirmar escritura SQLite (orden obligatorio)', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 5000, quantity: 1 })];
    // // ... insert in DB
    //
    // const executionOrder: string[] = [];
    //
    // jest.spyOn(db, 'transaction').mockImplementation(async (fn) => {
    //   const result = await originalTransaction(fn);
    //   executionOrder.push('sqlite_committed');
    //   return result;
    // });
    //
    // jest.spyOn(OutboxRepository.prototype, 'enqueue').mockImplementation(async () => {
    //   executionOrder.push('outbox_enqueued');
    // });
    //
    // Act
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    // await useCase.execute({ noteId: note.id, paymentMethod: 'transfer', amountReceivedCents: 5000 });
    //
    // Assert: SQLite primero, outbox después
    // expect(executionOrder).toEqual(['sqlite_committed', 'outbox_enqueued']);
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // AC-COBRO-08: Cobro con Tarjeta/Transferencia — campo monto no requerido para el flujo
  // (El monto recibido puede ser igual al total para no-efectivo)
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P1] Cobro con Tarjeta — amountReceived=total, changeCents=0', async () => {
    // THIS TEST WILL FAIL — ChargeNoteUseCase not implemented yet
    //
    // Setup: $150.00 con tarjeta
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 15000, quantity: 1 })];
    // // ... insert in DB
    //
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    // const result = await useCase.execute({
    //   noteId: note.id,
    //   paymentMethod: 'card',
    //   amountReceivedCents: 15000,
    // });
    //
    // expect(result.totalCents).toBe(15000);
    // expect(result.changeCents).toBe(0);
    // expect(result.paymentMethod).toBe('card');
    expect(true).toBe(false); // ← PLACEHOLDER
  });

  // ─────────────────────────────────────────────────────────────────
  // Cobro offline: Supabase mock lanzando → cobro completa
  // NFR-1: Offline-first
  // ─────────────────────────────────────────────────────────────────
  it.skip('[P0] NFR-1: cobro completa aunque Supabase mock lance error (offline)', async () => {
    // THIS TEST WILL FAIL — offline behavior not implemented yet
    //
    // Setup: supabase mock en modo offline
    // const db = await createTestDatabase();
    // const note = NoteFactory.create({ shiftId: ShiftFactory.create().id });
    // const items = [NoteItemFactory.create({ noteId: note.id, unitPriceCents: 6000, quantity: 1 })];
    // // ... insert in DB
    //
    // Mock Supabase offline
    // jest.mock('../../../infrastructure/sync/SupabaseClient', () => ({
    //   supabase: {
    //     from: jest.fn().mockRejectedValue(new Error('Network offline')),
    //   },
    // }));
    //
    // Act: cobro no debe fallar por Supabase offline
    // const useCase = new ChargeNoteUseCase(db, new MockPrintingService());
    // await expect(useCase.execute({
    //   noteId: note.id,
    //   paymentMethod: 'cash',
    //   amountReceivedCents: 6000,
    // })).resolves.not.toThrow();
    //
    // Assert: nota cerrada localmente en SQLite
    // const noteInDb = await db.select().from(schema.notes).where(eq(schema.notes.id, note.id));
    // expect(noteInDb[0].status).toBe('closed');
    //
    // Assert: outbox tiene la operación pendiente para cuando haya conexión
    // const pendingOutbox = await db.select().from(schema.outbox).where(eq(schema.outbox.status, 'pending'));
    // expect(pendingOutbox.length).toBeGreaterThan(0);
    expect(true).toBe(false); // ← PLACEHOLDER
  });

});

/*
 * ─────────────────────────────────────────────────────────────────
 * GUÍA DE ACTIVACIÓN (TDD Green Phase)
 * ─────────────────────────────────────────────────────────────────
 *
 * Para implementar Story 4b.3 (ChargeNoteUseCase):
 *
 * 1. Crear src/infrastructure/printing/MockPrintingService.ts en test-utils
 * 2. Crear src/application/notes/ChargeNoteUseCase.ts
 *    - Validar monto recibido ≥ total
 *    - Calcular total: sum(unitPriceCents × quantity) — enteros
 *    - Calcular cambio: amountReceived - total — enteros
 *    - Transacción SQLite atómica: update note + insert outbox
 *    - Llamar IPrintingService.print() — fallo no bloqueante
 *
 * 3. Activar tests en este orden:
 *    AC-COBRO-03 (validación) → AC-COBRO-01 (total) → AC-COBRO-02 (cambio)
 *    → AC-COBRO-06 (estado nota) → AC-COBRO-04 (printer fail)
 *    → AC-COBRO-05 (1 txn) → AC-COBRO-07 (outbox order) → NFR-1 (offline)
 *
 * 4. Ejecutar: npx jest src/application/notes/__tests__/ChargeNoteUseCase.test.ts
 * ─────────────────────────────────────────────────────────────────
 *
 * INVARIANTE CRÍTICA (BUS-001):
 *   NUNCA calcular: total = items.reduce((s, i) => s + i.price / 100 * i.qty, 0)
 *   SIEMPRE calcular: totalCents = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0)
 * ─────────────────────────────────────────────────────────────────
 */
