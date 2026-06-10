-- Helper function en schema PUBLIC (auth schema no disponible desde SQL Editor)
-- Extrae el branch_id del JWT del dispositivo (app_metadata)
CREATE OR REPLACE FUNCTION public.device_branch_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'branch_id')::uuid;
$$;

-- ─── SHIFTS ────────────────────────────────────────────────────────────────
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shifts_branch_isolation" ON shifts
  FOR ALL
  USING (branch_id::uuid = public.device_branch_id())
  WITH CHECK (branch_id::uuid = public.device_branch_id());

-- ─── NOTES ─────────────────────────────────────────────────────────────────
-- IMPORTANTE: La tabla `notes` en Supabase DEBE tener columna `branch_id`
-- (desnormalización intencional — diferente al schema SQLite local)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_branch_isolation" ON notes
  FOR ALL
  USING (branch_id::uuid = public.device_branch_id())
  WITH CHECK (branch_id::uuid = public.device_branch_id());

-- ─── PRODUCTS ──────────────────────────────────────────────────────────────
-- Catálogo global: escritura solo via service_role (lectura se abre en 003)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ─── BRANCHES ──────────────────────────────────────────────────────────────
-- Lectura se abre en 003_public_catalog_access.sql
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- ─── TABLAS PENDIENTES DE RLS ───────────────────────────────────────────────
-- TODO: Agregar RLS para note_items, cash_movements y branch_sort cuando sus
-- historias de sync definan el schema Supabase definitivo (branch_id, etc.).
-- Sin RLS habilitado, tokens autenticados pueden leer/escribir filas de
-- cualquier sucursal en estas tablas. Resolver en historias 4a/4b/Epic 3.
