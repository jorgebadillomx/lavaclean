-- Seed de datos iniciales para desarrollo y testing.
-- Incluye 1 sucursal y productos representativos de una lavandería.
-- Ejecutar DESPUÉS de 000_initial_schema.sql.

INSERT INTO branches (id, name, footer_message, created_at)
VALUES
  ('branch-01', 'Sucursal Centro', 'Gracias por su preferencia • LavaClean', '2026-01-01T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, price_cents, cost_cents, active, version, created_at)
VALUES
  ('prod-01', 'Lavado Express',         4500,  1500, TRUE, 1, '2026-01-01T00:00:00.000Z'),
  ('prod-02', 'Lavado Normal',          3500,  1200, TRUE, 1, '2026-01-01T00:00:00.000Z'),
  ('prod-03', 'Lavado + Secado',        6000,  2000, TRUE, 1, '2026-01-01T00:00:00.000Z'),
  ('prod-04', 'Secado',                 2500,   800, TRUE, 1, '2026-01-01T00:00:00.000Z'),
  ('prod-05', 'Lavado Ropa Delicada',   5000,  1800, TRUE, 1, '2026-01-01T00:00:00.000Z'),
  ('prod-06', 'Edredón Sencillo',       8000,  3000, TRUE, 1, '2026-01-01T00:00:00.000Z'),
  ('prod-07', 'Edredón Matrimonial',   10000,  4000, TRUE, 1, '2026-01-01T00:00:00.000Z'),
  ('prod-08', 'Lavado Tenis',           3000,  1000, TRUE, 1, '2026-01-01T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
