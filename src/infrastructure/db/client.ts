import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { runMigrations } from './migrations';

export const rawDb = openDatabaseSync('lavaclean.db');

rawDb.execSync('PRAGMA foreign_keys = ON;');
rawDb.execSync('PRAGMA journal_mode = WAL;');

runMigrations(rawDb);

export const db = drizzle(rawDb, { schema });
export type AppDB = typeof db;
