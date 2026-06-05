/* eslint-disable import/first */
jest.unmock('drizzle-orm/expo-sqlite');
import { expoSQLiteMock as mockExpoSQLiteMock } from '../../../test-utils/expoSQLiteMock';

jest.mock('expo-sqlite', () => mockExpoSQLiteMock());

import { eq } from 'drizzle-orm';
import { createTestDb } from '../../../test-utils/db-test-utils';
import * as schema from '../../db/schema';
import { BranchRepository } from '../BranchRepository';

describe('BranchRepository', () => {
  const { db: testDb, close } = createTestDb();

  beforeEach(() => {
    testDb.delete(schema.branches).run();
  });

  afterAll(() => {
    close();
  });

  it('findAll returns branches from SQLite', async () => {
    testDb.insert(schema.branches).values([
      {
        id: 'branch-1',
        name: 'Sucursal Centro',
        footer_message: 'Gracias por su preferencia',
        created_at: '2026-06-05T00:00:00.000Z',
      },
      {
        id: 'branch-2',
        name: 'Sucursal Norte',
        footer_message: null,
        created_at: '2026-06-05T00:00:00.000Z',
      },
    ]).run();

    const repository = new BranchRepository(testDb as never);
    await expect(repository.findAll()).resolves.toEqual([
      {
        id: 'branch-1',
        name: 'Sucursal Centro',
        footerMessage: 'Gracias por su preferencia',
        createdAt: '2026-06-05T00:00:00.000Z',
      },
      {
        id: 'branch-2',
        name: 'Sucursal Norte',
        footerMessage: null,
        createdAt: '2026-06-05T00:00:00.000Z',
      },
    ]);
  });

  it('findById returns the branch or null', async () => {
    testDb.insert(schema.branches).values({
      id: 'branch-1',
      name: 'Sucursal Centro',
      footer_message: 'Gracias por su preferencia',
      created_at: '2026-06-05T00:00:00.000Z',
    }).run();

    const repository = new BranchRepository(testDb as never);

    await expect(repository.findById('branch-1')).resolves.toEqual({
      id: 'branch-1',
      name: 'Sucursal Centro',
      footerMessage: 'Gracias por su preferencia',
      createdAt: '2026-06-05T00:00:00.000Z',
    });

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('save inserts and updates a branch in SQLite', async () => {
    const repository = new BranchRepository(testDb as never);

    await repository.save({
      id: 'branch-1',
      name: 'Sucursal Centro',
      footerMessage: 'Mensaje inicial',
      createdAt: '2026-06-05T00:00:00.000Z',
    });

    await repository.save({
      id: 'branch-1',
      name: 'Sucursal Centro Actualizada',
      footerMessage: null,
      createdAt: '2026-06-05T01:00:00.000Z',
    });

    const stored = testDb.select().from(schema.branches)
      .where(eq(schema.branches.id, 'branch-1'))
      .all();

    expect(stored).toEqual([
      {
        id: 'branch-1',
        name: 'Sucursal Centro Actualizada',
        footer_message: null,
        created_at: '2026-06-05T01:00:00.000Z',
      },
    ]);
  });
});
