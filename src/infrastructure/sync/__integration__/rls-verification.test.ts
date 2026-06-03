/**
 * Tests de verificación de Row Level Security.
 *
 * CÓMO EJECUTAR MANUALMENTE:
 * 1. Aplicar migraciones 001 y 002 en tu proyecto Supabase
 * 2. Crear 2 usuarios Supabase Auth con branch_id en app_metadata:
 *    UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"branch_id": "<uuid>"}'
 *    WHERE id = '<device_user_id>';
 * 3. Obtener tokens JWT de cada usuario vía Supabase Auth
 * 4. Configurar variables de entorno:
 *    SUPABASE_TEST_URL, SUPABASE_TEST_ANON_KEY, BRANCH_A_TOKEN, BRANCH_B_ID
 * 5. Cambiar describe.skip por describe y ejecutar: yarn test rls-verification
 */

import { createClient } from '@supabase/supabase-js';

const TEST_URL = process.env.SUPABASE_TEST_URL ?? '';
const TEST_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY ?? '';
const BRANCH_A_TOKEN = process.env.BRANCH_A_TOKEN ?? '';
const BRANCH_B_ID = process.env.BRANCH_B_ID ?? '';

describe.skip('RLS Integration Verification', () => {
  describe('RLS-03: ANON_KEY sin JWT → 0 filas', () => {
    it('shifts retorna 0 filas con ANON_KEY sin Authorization', async () => {
      const anonClient = createClient(TEST_URL, TEST_ANON_KEY);
      const { data, error } = await anonClient.from('shifts').select('*');
      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it('notes retorna 0 filas con ANON_KEY sin Authorization', async () => {
      const anonClient = createClient(TEST_URL, TEST_ANON_KEY);
      const { data } = await anonClient.from('notes').select('*');
      expect(data).toEqual([]);
    });

    it('products retorna 0 filas con ANON_KEY sin Authorization', async () => {
      const anonClient = createClient(TEST_URL, TEST_ANON_KEY);
      const { data } = await anonClient.from('products').select('*');
      expect(data).toEqual([]);
    });

    it('branches retorna 0 filas con ANON_KEY sin Authorization', async () => {
      const anonClient = createClient(TEST_URL, TEST_ANON_KEY);
      const { data } = await anonClient.from('branches').select('*');
      expect(data).toEqual([]);
    });
  });

  describe('RLS-01: Token Branch A → solo shifts de Branch A', () => {
    it('shifts filtrado por branch_id del token', async () => {
      const clientA = createClient(TEST_URL, TEST_ANON_KEY);
      await clientA.auth.setSession({ access_token: BRANCH_A_TOKEN, refresh_token: '' });
      const { data } = await clientA.from('shifts').select('*');
      expect(data?.every((row: { branch_id: string }) => row.branch_id !== BRANCH_B_ID)).toBe(true);
    });
  });

  describe('RLS-02: Token Branch A → INSERT con branch_id=B rechazado', () => {
    it('INSERT con branch_id ajeno falla con error de política', async () => {
      const clientA = createClient(TEST_URL, TEST_ANON_KEY);
      await clientA.auth.setSession({ access_token: BRANCH_A_TOKEN, refresh_token: '' });
      const { error } = await clientA.from('shifts').insert({
        id: 'test-shift-rls',
        branch_id: BRANCH_B_ID,
        operator_name: 'Test',
        status: 'open',
        opened_at: new Date().toISOString(),
      });
      expect(error).not.toBeNull();
    });
  });
});
