-- Revocar acceso anon a todas las tablas en el schema público.
-- Con esto, el ANON_KEY expuesto en el APK queda inútil para acceder a datos.
-- Referencia: ARC-8, RLS-03, RLS-04
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Cubre tablas creadas en migraciones futuras (ON ALL TABLES solo aplica a las existentes).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon;
