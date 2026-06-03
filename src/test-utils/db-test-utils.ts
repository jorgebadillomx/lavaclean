import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../infrastructure/db/schema';
import { runMigrations } from '../infrastructure/db/migrations';

export function createTestDb() {
  const rawDb = openDatabaseSync(':memory:');
  rawDb.execSync('PRAGMA foreign_keys = ON;');
  rawDb.execSync('PRAGMA journal_mode = WAL;');
  runMigrations(rawDb);
  const db = drizzle(rawDb, { schema });
  return { db, rawDb, close: () => rawDb.closeSync() };
}
