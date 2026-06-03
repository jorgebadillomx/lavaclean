import { AppState } from 'react-native';
import { SyncEngine } from '../SyncEngine';
import type { AppDB } from '../../db/client';
import * as schema from '../../db/schema';

type OutboxRow = typeof schema.outbox.$inferSelect;
type MetaRow = typeof schema._meta.$inferSelect;

function makeDbMock(options: {
  metaRow?: MetaRow;
  outboxEntries?: OutboxRow[];
  updateRun?: jest.Mock;
} = {}): AppDB {
  const { metaRow, outboxEntries = [], updateRun = jest.fn() } = options;

  return {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockImplementation((table: unknown) => ({
        where: jest.fn().mockReturnValue({
          all: jest.fn().mockReturnValue(
            table === schema._meta
              ? metaRow ? [metaRow] : []
              : outboxEntries
          ),
        }),
      })),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          run: updateRun,
        }),
      }),
    }),
  } as unknown as AppDB;
}

describe('SyncEngine', () => {
  let engine: SyncEngine;

  beforeEach(() => {
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() } as ReturnType<typeof AppState.addEventListener>);
  });

  afterEach(() => {
    engine?.destroy();
  });

  it('AC-SYNC-02: segunda llamada a trySync no ejecuta runSync si la primera está en curso', async () => {
    engine = new SyncEngine(makeDbMock());

    let resolveFirst!: () => void;
    const firstRunPromise = new Promise<void>((res) => {
      resolveFirst = res;
    });
    const runSyncSpy = jest
      .spyOn(engine as unknown as { runSync(): Promise<void> }, 'runSync')
      .mockReturnValueOnce(firstRunPromise);

    engine.trySync();
    engine.trySync();

    resolveFirst();
    await Promise.resolve();

    expect(runSyncSpy).toHaveBeenCalledTimes(1);
  });

  it('AC-SYNC-03: markDeadLetter actualiza outbox a dead_letter y emite evento', async () => {
    const updateRun = jest.fn();
    const fakeEntry: OutboxRow = {
      id: 'outbox-id-1',
      entity_id: 'entity-1',
      entity_type: 'producto',
      operation: 'INSERT',
      payload: '{}',
      idempotency_key: 'idem-1',
      retry_count: 6,
      last_error: null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Dedicated mock that captures select-where calls so we can verify
    // markDeadLetter issues exactly one by-id lookup before the update.
    const selectWhere = jest.fn().mockReturnValue({ all: jest.fn().mockReturnValue([fakeEntry]) });
    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({ where: selectWhere }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ run: updateRun }),
        }),
      }),
    } as unknown as AppDB;

    engine = new SyncEngine(db);

    const listener = jest.fn();
    engine.on('outbox.dead_letter', listener);

    await engine.markDeadLetter('outbox-id-1');

    expect(selectWhere).toHaveBeenCalledTimes(1);
    expect(updateRun).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith({
      entityId: 'entity-1',
      entityType: 'producto',
      outboxId: 'outbox-id-1',
    });
  });

  it('AC-SYNC-04: ping se llama en initialize() cuando last_sync_at tiene >5 días', () => {
    const sixDaysAgo = new Date(
      Date.now() - 6 * 24 * 60 * 60 * 1000,
    ).toISOString();

    engine = new SyncEngine(
      makeDbMock({ metaRow: { key: 'last_sync_at', value: sixDaysAgo } }),
    );

    const pingSpy = jest.spyOn(engine, 'ping');
    engine.initialize();

    expect(pingSpy).toHaveBeenCalled();
  });

  it('AC-SYNC-04b: ping NO se llama en initialize() cuando last_sync_at es reciente', () => {
    const today = new Date().toISOString();

    engine = new SyncEngine(
      makeDbMock({ metaRow: { key: 'last_sync_at', value: today } }),
    );

    const pingSpy = jest.spyOn(engine, 'ping');
    engine.initialize();

    expect(pingSpy).not.toHaveBeenCalled();
  });
});
