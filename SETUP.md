# Setup inicial

1. Instala dependencias con `yarn install` o `npm install`.
2. Crea tu archivo local `.env` a partir de `.env.example`.
3. Configura los secretos de EAS para `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SENTRY_DSN` y `ADMIN_SALT`.
4. Ejecuta `npm run start` y abre la app en un dispositivo Android físico.
5. Ejecuta `npm test` y `npm run type-check` antes de abrir cambios.

## Notas

- La app está pensada para Android.
- `main` queda reservado para producción y `develop` para integración.
- No subas `.env` real al repositorio.
