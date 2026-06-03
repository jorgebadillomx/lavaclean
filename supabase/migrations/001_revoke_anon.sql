-- Revocar acceso anon a todas las tablas en el schema público.
-- Con esto, el ANON_KEY expuesto en el APK queda inútil para acceder a datos.
-- Referencia: ARC-8, RLS-03, RLS-04
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
