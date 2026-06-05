# Pruebas E2E

Este directorio contiene la base de pruebas browser-first para LavaClean con Playwright y `@seontechnologies/playwright-utils`.

## Instalación y preparación

- Instala dependencias con `yarn install`.
- Copia las variables de [`.env.example`](c:/Users/jorge/source/repos/lavaclean/.env.example) a tu `.env` local.
- Define `BASE_URL` para apuntar a la app web, o usa el valor por defecto del `playwright.config.ts`.
- Si vas a probar la UI localmente, arranca Expo con `yarn web`.

## Ejecución

- Local: `yarn test:e2e`
- Con navegador visible: `yarn test:e2e:headed`
- Depuración interactiva: `yarn test:e2e:debug`

## Arquitectura

- [`tests/e2e/`](c:/Users/jorge/source/repos/lavaclean/tests/e2e) contiene los specs ejecutables.
- [`tests/support/fixtures/index.ts`](c:/Users/jorge/source/repos/lavaclean/tests/support/fixtures/index.ts) compone los fixtures compartidos.
- [`tests/support/helpers/`](c:/Users/jorge/source/repos/lavaclean/tests/support/helpers) agrupa factories, cleanup y utilidades.
- [`tests/support/page-objects/`](c:/Users/jorge/source/repos/lavaclean/tests/support/page-objects) centraliza page objects.

## Buenas prácticas

- Usa roles, labels y `data-testid` para selectores estables.
- Prepara datos con factories, no con pasos lentos de UI.
- Aísla cada prueba y registra limpiezas en el `cleanupRegistry` cuando la prueba cree estado temporal.
- Usa `log.step()` para dejar trazabilidad legible en los reportes.
- Mantén los tests focalizados en una sola intención de negocio.

## CI

- Ejecuta `yarn test:e2e` en la validación de PR.
- Publica `test-results/`, traces y screenshots como artefactos cuando falle la suite.
- Ajusta `BASE_URL` en CI para apuntar al entorno correcto.
- Conserva la ejecución paralela habilitada en `playwright.config.ts`.

## Referencias

- [overview.md](c:/Users/jorge/source/repos/lavaclean/.agents/skills/bmad-testarch-framework/resources/knowledge/overview.md)
- [fixtures-composition.md](c:/Users/jorge/source/repos/lavaclean/.agents/skills/bmad-testarch-framework/resources/knowledge/fixtures-composition.md)
- [auth-session.md](c:/Users/jorge/source/repos/lavaclean/.agents/skills/bmad-testarch-framework/resources/knowledge/auth-session.md)
- [api-request.md](c:/Users/jorge/source/repos/lavaclean/.agents/skills/bmad-testarch-framework/resources/knowledge/api-request.md)
- [data-factories.md](c:/Users/jorge/source/repos/lavaclean/.agents/skills/bmad-testarch-framework/resources/knowledge/data-factories.md)
- [intercept-network-call.md](c:/Users/jorge/source/repos/lavaclean/.agents/skills/bmad-testarch-framework/resources/knowledge/intercept-network-call.md)
- [network-error-monitor.md](c:/Users/jorge/source/repos/lavaclean/.agents/skills/bmad-testarch-framework/resources/knowledge/network-error-monitor.md)
