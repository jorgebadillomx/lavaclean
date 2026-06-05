/* eslint-disable import/first */
jest.unmock('drizzle-orm/expo-sqlite');
import { expoSQLiteMock as mockExpoSQLiteMock } from '../../../../../test-utils/expoSQLiteMock';

jest.mock('expo-sqlite', () => mockExpoSQLiteMock());
jest.mock('../../../../../infrastructure/sync/SupabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
  setSupabaseSession: jest.fn(),
}));

import { fireEvent, render, waitFor, act } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { eq } from 'drizzle-orm';

import { createSupabaseMock } from '../../../../../test-utils/supabase-mock';
import { createTestDb } from '../../../../../test-utils/db-test-utils';
import * as schema from '../../../../../infrastructure/db/schema';
import { BranchRepository } from '../../../../../infrastructure/repositories/BranchRepository';
import { useAppStore } from '../../../../store';
import { BranchSelectScreen } from '../BranchSelectScreen';

describe('BranchSelectScreen', () => {
  const { db, close } = createTestDb();

  beforeEach(() => {
    db.delete(schema.branches).run();
    db.delete(schema._meta).run();
    useAppStore.setState({
      activeBranch: null,
      activeShift: null,
      products: [],
    } as never);
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.addEventListener as jest.Mock).mockReset();
  });

  afterAll(() => {
    close();
  });

  it('carga sucursales desde Supabase cuando hay conexión', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    const supabase = createSupabaseMock([
      {
        id: 'branch-1',
        name: 'Sucursal Centro',
        footer_message: 'Gracias por su preferencia',
        created_at: '2026-06-05T00:00:00.000Z',
      },
    ]);
    const repository = new BranchRepository(db as never);

    const { getByText } = render(
      <BranchSelectScreen
        dbInstance={db as never}
        repository={repository}
        supabaseClient={supabase as never}
      />,
    );

    await waitFor(() => {
      expect(getByText('Sucursal Centro')).toBeTruthy();
      expect(getByText('branch-1')).toBeTruthy();
    });

    expect(db.select().from(schema.branches).where(eq(schema.branches.id, 'branch-1')).all()).toHaveLength(1);
  });

  it('muestra el mensaje de primera configuración sin caché cuando no hay conexión', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    const supabase = createSupabaseMock([]);
    const repository = new BranchRepository(db as never);

    const { getByText, queryByRole } = render(
      <BranchSelectScreen
        dbInstance={db as never}
        repository={repository}
        supabaseClient={supabase as never}
      />,
    );

    await waitFor(() => {
      expect(getByText('Se necesita conexión para configurar la sucursal la primera vez.')).toBeTruthy();
    });

    expect(queryByRole('button', { name: 'Confirmar sucursal' })).toBeNull();
  });

  it('muestra la caché local aunque esté offline', async () => {
    db.insert(schema.branches).values({
      id: 'branch-2',
      name: 'Sucursal Norte',
      footer_message: null,
      created_at: '2026-06-05T00:00:00.000Z',
    }).run();

    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    const supabase = createSupabaseMock([]);
    const repository = new BranchRepository(db as never);

    const { getByText } = render(
      <BranchSelectScreen
        dbInstance={db as never}
        repository={repository}
        supabaseClient={supabase as never}
      />,
    );

    await waitFor(() => {
      expect(getByText('Sucursal Norte')).toBeTruthy();
      expect(getByText('branch-2')).toBeTruthy();
    });
  });

  it('persiste la sucursal seleccionada en _meta y en el store', async () => {
    db.insert(schema.branches).values({
      id: 'branch-3',
      name: 'Sucursal Sur',
      footer_message: null,
      created_at: '2026-06-05T00:00:00.000Z',
    }).run();

    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    const supabase = createSupabaseMock([]);
    const repository = new BranchRepository(db as never);

    const { getByText, getByRole } = render(
      <BranchSelectScreen
        dbInstance={db as never}
        repository={repository}
        supabaseClient={supabase as never}
      />,
    );

    await waitFor(() => {
      expect(getByText('Sucursal Sur')).toBeTruthy();
    });

    fireEvent.press(getByText('Sucursal Sur'));
    fireEvent.press(getByRole('button', { name: 'Confirmar sucursal' }));

    await waitFor(() => {
      expect(useAppStore.getState().activeBranch).toBe('branch-3');
      expect(db.select().from(schema._meta).where(eq(schema._meta.key, 'active_branch_id')).all()).toEqual([
        { key: 'active_branch_id', value: 'branch-3' },
      ]);
    });
  });

  it('reintenta automáticamente cuando vuelve la conexión', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    const supabase = createSupabaseMock([
      {
        id: 'branch-4',
        name: 'Sucursal Poniente',
        footer_message: null,
        created_at: '2026-06-05T00:00:00.000Z',
      },
    ]);
    const repository = new BranchRepository(db as never);

    const { getByText } = render(
      <BranchSelectScreen
        dbInstance={db as never}
        repository={repository}
        supabaseClient={supabase as never}
      />,
    );

    await waitFor(() => {
      expect(getByText('Se necesita conexión para configurar la sucursal la primera vez.')).toBeTruthy();
    });

    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    const calls = (NetInfo.addEventListener as jest.Mock).mock.calls;
    const listener = calls[calls.length - 1][0];
    await act(async () => {
      listener({ isConnected: true });
    });

    await waitFor(() => {
      expect(getByText('Sucursal Poniente')).toBeTruthy();
    });
  });
});
