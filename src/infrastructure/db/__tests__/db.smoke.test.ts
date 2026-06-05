/* eslint-disable import/first */
jest.unmock('drizzle-orm/expo-sqlite');
import { eq } from 'drizzle-orm';
import { expoSQLiteMock as mockExpoSQLiteMock } from '../../../test-utils/expoSQLiteMock';

jest.mock('expo-sqlite', () => mockExpoSQLiteMock());

import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../schema';
import { runMigrations } from '../migrations';

it('opens SQLite in memory, runs migrations, and selects from schema.shifts without throwing', () => {
  const rawDb = openDatabaseSync(':memory:');
  rawDb.execSync('PRAGMA foreign_keys = ON;');
  rawDb.execSync('PRAGMA journal_mode = WAL;');
  runMigrations(rawDb);
  const db = drizzle(rawDb, { schema });

  const result = db.select().from(schema.shifts).limit(1).all();

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);

  const storageThreshold = db.select().from(schema._meta)
    .where(eq(schema._meta.key, 'storage_alert_threshold_mb'))
    .all();

  expect(storageThreshold).toEqual([
    {
      key: 'storage_alert_threshold_mb',
      value: '400',
    },
  ]);
  rawDb.closeSync();
});
