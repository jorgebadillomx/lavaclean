import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { eq } from 'drizzle-orm';
import type { AppDB } from '../db/client';
import * as schema from '../db/schema';

export type SyncEventType = 'outbox.dead_letter';

export type DeadLetterEvent = {
  entityId: string;
  entityType: string;
  outboxId: string;
};

type SyncEventListener = (event: DeadLetterEvent) => void;

const MAX_RETRIES = 5;
const KEEP_ALIVE_DAYS = 5;
// Backoff values (seconds) for SERVER_ERROR — logic applied in historia 1.6
const BACKOFF_SECONDS = {
  first: 30,
  second: 120,
  third: 600,
} as const;

// Suppress unused warning — constants will be used in historia 1.6
void BACKOFF_SECONDS;

export class SyncEngine {
  private isSyncing = false;
  private listeners = new Map<SyncEventType, SyncEventListener[]>();
  private netInfoUnsubscribe: (() => void) | null = null;
  private appStateSubscription: { remove: () => void } | null = null;

  constructor(private readonly db: AppDB) {}

  initialize(): void {
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.trySync();
      }
    });

    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          this.trySync();
        }
      },
    );

    this.checkKeepAlive();
  }

  destroy(): void {
    this.netInfoUnsubscribe?.();
    this.netInfoUnsubscribe = null;
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }

  trySync(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.runSync()
      .catch(() => {})
      .finally(() => {
        this.isSyncing = false;
      });
  }

  ping(): void {
    this.trySync();
  }

  on(event: SyncEventType, listener: SyncEventListener): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, listener]);
  }

  off(event: SyncEventType, listener: SyncEventListener): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, existing.filter((l) => l !== listener));
  }

  async markDeadLetter(outboxId: string): Promise<void> {
    const entry = this.db
      .select()
      .from(schema.outbox)
      .where(eq(schema.outbox.id, outboxId))
      .all()[0];

    if (!entry) return;

    this.db
      .update(schema.outbox)
      .set({ status: 'dead_letter' })
      .where(eq(schema.outbox.id, outboxId))
      .run();

    this.emit('outbox.dead_letter', {
      entityId: entry.entity_id,
      entityType: entry.entity_type,
      outboxId,
    });
  }

  private async runSync(): Promise<void> {
    const pendingEntries = this.db
      .select()
      .from(schema.outbox)
      .where(eq(schema.outbox.status, 'pending'))
      .all();

    for (const entry of pendingEntries) {
      if (entry.retry_count >= MAX_RETRIES) {
        await this.markDeadLetter(entry.id);
      }
    }
  }

  private checkKeepAlive(): void {
    const metaRow = this.db
      .select()
      .from(schema._meta)
      .where(eq(schema._meta.key, 'last_sync_at'))
      .all()[0];

    if (!metaRow) {
      // First boot: device has never synced, trigger an initial ping.
      this.ping();
      return;
    }

    const lastSync = new Date(metaRow.value);
    const now = new Date();

    if (isNaN(lastSync.getTime())) {
      // Corrupt last_sync_at value — treat as stale and ping to recover.
      this.ping();
      return;
    }

    const diffDays = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays >= KEEP_ALIVE_DAYS) {
      this.ping();
    }
  }

  private emit(event: SyncEventType, data: DeadLetterEvent): void {
    const callbacks = this.listeners.get(event) ?? [];
    callbacks.forEach((cb) => cb(data));
  }
}
