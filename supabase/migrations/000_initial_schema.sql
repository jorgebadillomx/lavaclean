-- Schema inicial de LavaClean en Supabase (PostgreSQL)
-- Equivalente al schema SQLite de Story 1.2, con diferencias intencionales:
--   • notes incluye branch_id (desnormalización para RLS — ver architecture.md)
--   • products.active es BOOLEAN (no INTEGER 0/1 como en SQLite)
-- Ejecutar PRIMERO antes de cualquier otra migración.

CREATE TABLE IF NOT EXISTS branches (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  footer_message TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK(price_cents >= 0),
  cost_cents  INTEGER CHECK(cost_cents IS NULL OR cost_cents >= 0),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  version     INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS branch_sort (
  branch_id   TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL REFERENCES products(id),
  sort_order  INTEGER NOT NULL,
  PRIMARY KEY (branch_id, product_id)
);

CREATE TABLE IF NOT EXISTS shifts (
  id                   TEXT PRIMARY KEY,
  branch_id            TEXT NOT NULL REFERENCES branches(id),
  operator_name        TEXT NOT NULL,
  status               TEXT NOT NULL CHECK(status IN ('open', 'closed')),
  opened_at            TEXT NOT NULL,
  closed_at            TEXT,
  initial_bills_cents  INTEGER NOT NULL DEFAULT 0 CHECK(initial_bills_cents >= 0),
  initial_coins_cents  INTEGER NOT NULL DEFAULT 0 CHECK(initial_coins_cents >= 0),
  final_bills_cents    INTEGER CHECK(final_bills_cents IS NULL OR final_bills_cents >= 0),
  final_coins_cents    INTEGER CHECK(final_coins_cents IS NULL OR final_coins_cents >= 0)
);

-- CRÍTICO: notes en Supabase tiene branch_id (no existe en SQLite local).
-- Es una desnormalización intencional para RLS eficiente sin JOINs.
-- El SyncEngine incluirá branch_id en el payload del outbox (vía shift.branch_id).
CREATE TABLE IF NOT EXISTS notes (
  id                    TEXT PRIMARY KEY,
  shift_id              TEXT NOT NULL REFERENCES shifts(id),
  branch_id             TEXT NOT NULL REFERENCES branches(id),
  customer_alias        TEXT NOT NULL CHECK(length(customer_alias) > 0),
  status                TEXT NOT NULL CHECK(status IN ('open', 'closed', 'cancelled')),
  cancelled_reason      TEXT,
  created_at            TEXT NOT NULL,
  closed_at             TEXT,
  payment_method        TEXT CHECK(payment_method IS NULL OR payment_method IN ('cash', 'card', 'transfer')),
  amount_received_cents INTEGER CHECK(amount_received_cents IS NULL OR amount_received_cents >= 0),
  change_cents          INTEGER CHECK(change_cents IS NULL OR change_cents >= 0),
  ticket_payload        TEXT
);

CREATE TABLE IF NOT EXISTS note_items (
  id                    TEXT PRIMARY KEY,
  note_id               TEXT NOT NULL REFERENCES notes(id),
  product_id            TEXT NOT NULL REFERENCES products(id),
  product_name_snapshot TEXT NOT NULL,
  unit_price_cents      INTEGER NOT NULL CHECK(unit_price_cents >= 0),
  quantity              INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0)
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id          TEXT PRIMARY KEY,
  shift_id    TEXT NOT NULL REFERENCES shifts(id),
  type        TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outbox (
  id               TEXT PRIMARY KEY,
  entity_type      TEXT NOT NULL,
  entity_id        TEXT NOT NULL,
  operation        TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
  payload          TEXT NOT NULL,
  idempotency_key  TEXT NOT NULL UNIQUE,
  retry_count      INTEGER NOT NULL DEFAULT 0 CHECK(retry_count >= 0 AND retry_count <= 5),
  last_error       TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'synced', 'failed', 'dead_letter')),
  created_at       TEXT NOT NULL
);

-- Índices de rendimiento (espejo de SQLite)
CREATE INDEX IF NOT EXISTS idx_outbox_status_created   ON outbox(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notes_shift_status      ON notes(shift_id, status);
CREATE INDEX IF NOT EXISTS idx_shifts_branch_status    ON shifts(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_note_items_note         ON note_items(note_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_shift    ON cash_movements(shift_id);
