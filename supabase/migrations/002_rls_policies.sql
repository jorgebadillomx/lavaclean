-- Helper function: extrae branch_id del JWT del dispositivo (app_metadata)
CREATE OR REPLACE FUNCTION auth.branch_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'branch_id')::uuid;
$$;

-- ─── SHIFTS ────────────────────────────────────────────────────────────────
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shifts_branch_isolation" ON shifts
  FOR ALL
  USING (branch_id = auth.branch_id())
  WITH CHECK (branch_id = auth.branch_id());

-- ─── NOTES ─────────────────────────────────────────────────────────────────
-- IMPORTANTE: La tabla `notes` en Supabase DEBE tener columna `branch_id`
-- (desnormalización intencional — diferente al schema SQLite local)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_branch_isolation" ON notes
  FOR ALL
  USING (branch_id = auth.branch_id())
  WITH CHECK (branch_id = auth.branch_id());

-- ─── PRODUCTS ──────────────────────────────────────────────────────────────
-- Catálogo global: lectura para todos los autenticados, escritura solo via service_role
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_read_authenticated" ON products
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ─── BRANCHES ──────────────────────────────────────────────────────────────
-- Cada dispositivo solo ve su propia sucursal
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_read_own" ON branches
  FOR SELECT
  USING (id = auth.branch_id());

-- ─── TABLAS PENDIENTES DE RLS ───────────────────────────────────────────────
-- TODO: Agregar RLS para note_items, cash_movements y branch_sort cuando sus
-- historias de sync definan el schema Supabase definitivo (branch_id, etc.).
-- Sin RLS habilitado, tokens autenticados pueden leer/escribir filas de
-- cualquier sucursal en estas tablas. Resolver en historias 4a/4b/Epic 3.
