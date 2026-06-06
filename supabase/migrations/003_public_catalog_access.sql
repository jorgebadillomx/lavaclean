-- Acceso público al catálogo de branches y products para hidratación inicial.
--
-- CONTEXTO: La app hace hidratación en el primer arranque (Story 2.4) y carga
-- branches en BranchSelectScreen ANTES de tener un JWT de dispositivo. Por eso
-- branches y products deben ser legibles con el ANON_KEY sin autenticación.
--
-- Esto NO es un hueco de seguridad: branches y products son datos de catálogo,
-- no datos operacionales. Los datos sensibles (shifts, notes, cash_movements)
-- siguen protegidos por RLS con JWT.
--
-- Ejecutar DESPUÉS de 001_revoke_anon.sql y 002_rls_policies.sql.

-- Re-otorgar SELECT en catálogo público al rol anon
GRANT SELECT ON branches TO anon;
GRANT SELECT ON products  TO anon;

-- Política RLS: cualquier request (incluso sin JWT) puede leer branches
DROP POLICY IF EXISTS "branches_read_own" ON branches;
CREATE POLICY "branches_read_all" ON branches
  FOR SELECT
  USING (true);

-- Política RLS: cualquier request puede leer products activos
DROP POLICY IF EXISTS "products_read_authenticated" ON products;
CREATE POLICY "products_read_all" ON products
  FOR SELECT
  USING (true);
