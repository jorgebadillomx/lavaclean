# Deferred Work

## Deferred from: code review of 1-1-scaffold-del-proyecto-y-pipeline-ci-cd (2026-06-02)

- `createDatabase` en `src/infrastructure/db/client.ts` no tiene manejo de error para `openDatabaseSync`/`execSync` — Sprint 0 placeholder; el manejo de errores y recuperación va en historias posteriores.
- `eas.json` perfil producción sin `credentialsSource: "remote"` — EAS build no-interactivo fallará en CI hasta que se configure el keystore. Abordado en Story 1.8.
- `metro.config.js` `conditionNames: ['require', 'default']` puede resolver módulos a entry points de Node en vez de react-native — Requerido por spec para Drizzle; verificar compatibilidad cuando Drizzle se use activamente en Story 1.2.
- `ADMIN_SALT` sin validación en runtime — valor vacío/ausente no lanza error de startup. Validación va en `AdminAuthService` (Story 1.4).

## Deferred from: code review of 1-2-schema-sqlite-y-capa-de-base-de-datos-local (2026-06-02)

- W1: Crash en import de `client.ts` sin manejo de error — diseño intencional; el InitializationGate (Story 1.3) es la capa de recuperación designada.
- W2: `outbox.retry_count` sin lógica de promoción a `dead_letter` — scope de Story 1.5 (SyncEngine).
- W3: Race TOCTOU en check de `schema_version` — extremadamente improbable en mobile single-process con WAL; DDL idempotente con `IF NOT EXISTS`.
- W4: Convención de signo positivo en `cash_movements.amount_cents` para gastos sin documentar — convención establecida en la spec; documentar en futura ADR de decisiones de schema.
- W5: `PRAGMA journal_mode = WAL` silencioso en SQLite `:memory:` en tests — comportamiento estándar de SQLite; sin impacto en producción.
- ~~W6: Mock de `expo-sqlite` no centralizado; cada test que use `createTestDb()` debe configurar su propio mock node:sqlite~~ — **RESUELTO 2026-06-05**: mock extraído a `src/test-utils/expoSQLiteMock.ts`; `db.smoke.test.ts` y `hydrateStore.test.ts` usan una línea con `require('../test-utils/expoSQLiteMock').expoSQLiteMock()`.
- W7: `_meta` se crea fuera de la transacción de migración — riesgo muy bajo; `CREATE IF NOT EXISTS` garantiza idempotencia en reinicios.
- W8: `ticket_payload` TEXT sin límite de tamaño en `notes` — concern de archivado; abordar en épicas de historial/reporting.

## Deferred from: code review of 1-3-initializationgate-y-zustand-store (2026-06-02)

- Múltiples turnos abiertos por sucursal — `.find()` retorna el primero arbitrariamente sin advertencia al usuario. Scope de historias de gestión de turnos (Epic 4a).
- `ADMIN_SALT` en `.env.example` sin documentación ni validación de entropía mínima en runtime. Validación va en `AdminAuthService` (Story 1.4).
- Sin test de montaje de componente para AC INIT_STATE_001 — requiere infra React Testing Library completa. Abordar en Story 2.x cuando existan componentes de negocio reales.
- `react-native-worklets@^0.8.3` coexiste con `react-native-reanimated@4.3.1` — posible conflicto de runtime de worklets en el bridge nativo. Verificar en Story 1.8 (EAS build en dispositivo físico).
- ~~`activeBranch` no valida existencia en tabla `branches` — un `branch_id` huérfano en `_meta` pasa silenciosamente y deja `activeShift = null` sin señal al usuario.~~ — **RESUELTO 2026-06-05**: `hydrateStore` ahora valida `activeBranch` contra la tabla `branches` y limpia el `_meta` si no existe la fila.

## Deferred from: code review of 1-5-networkerrorclassifier-y-esqueleto-del-syncengine (2026-06-03)

- `markDeadLetter` re-selecciona row ya disponible desde `runSync` — N+1 query; optimizar en historia 1.6 pasando la entrada pre-cargada como parámetro.
- Entradas con `status: 'failed'` silenciosamente ignoradas en `runSync` — la lógica de retry/failed handling es scope de historia 1.6.
- Race: `checkKeepAlive` en `initialize()` puede emitir evento `outbox.dead_letter` antes de que el caller registre listeners — mitigar cuando `runSync` tenga lógica real en historia 1.6 (posiblemente diferir `checkKeepAlive` a un tick async).
- `extractHttpStatus` acepta `status: 0` o valores negativos — clasificación incorrecta para valores fuera del rango HTTP estándar; edge case poco probable con Supabase pero agregar validación de rango en historia posterior.

## Deferred from: code review of 1-6-configuracion-de-supabase-rls (2026-06-03)

- `auth.branch_id()` retorna NULL silenciosamente cuando el JWT no tiene `app_metadata.branch_id` — resultado indistinguible del caso anon; hardening de seguridad para historia futura (e.g., wrapper que lanza si branch_id es NULL).
- Tests de integración RLS permanentemente skipped en CI — constraint arquitectural documentado; sin path automatizado de verificación de políticas Supabase en el pipeline.

## Deferred from: code review of 1-7-sistema-de-diseno-tokens-y-componentes-atomicos (2026-06-03)

- CounterButton: sin guard de valor mínimo — el decremento puede bajar de cero; responsabilidad del caller según spec. Revisar al implementar historias 4b que usen CounterButton con lógica de cantidad.
- ConnectivityBadge: estado inicial `null` oculta badge durante fetch — diseño intencional para evitar flash; considerar skeleton/estado indeterminado si UX lo requiere.
- BottomSheet: remoción del Modal sin `visible=false` produce flash visual en Android — edge case menor; abordar si se reporta en pruebas en dispositivo (Story 1.8).
- TabBar: array `tabs` vacío renderiza espacio en blanco sin fallback — agregar guard o prop warning al integrar TabBar en POSScreen (Story 4a.2).
- TabBar: `hiddenIndicator: {}` puede heredar color de fondo en algunos OEMs Android — agregar `backgroundColor: 'transparent'` explícito al integrar.
- tokens.ts: `lineHeightBase`/`lineHeightTight` son multiplicadores nombrados como valores absolutos — riesgo de uso directo como `lineHeight: Typography.lineHeightBase` (=1.5px). Renombrar a `lineHeightMultiplierBase/Tight` en refactor de tokens.
- AppHeader: iconos Unicode (☰, ∿, ↯) pueden renderizar inconsistentemente en OEMs Android — migrar a `@expo/vector-icons` en historia posterior cuando existan pantallas reales.
- AppHeader: `ConnectivityBadge` + `title` pueden clipear en pantallas ≤320pt — revisar en Story 1.8 al probar en dispositivo físico.
- AppHeader: `title` renderizado como texto secundario (14sp, opacity 0.88) — spec no especifica tratamiento; aclarar diseño al implementar Story 2.x con operadores.
- CounterButton: valor con ≥3 dígitos desborda `minWidth: 24` — agregar `minWidth` dinámico o `adjustsFontSizeToFit` al integrar en historias 4b.
- ConnectivityBadge test: aserción "renders nothing when online" es vacua — fortalecer con verificación de que `null` es retornado explícitamente.
- Tag test: `label.parent?.parent` traversal frágil — refactorizar a `testID` si Tag se reestructura en historias posteriores.
- Spacing: token `xxl` vs spec `2xl` — `2xl` es identificador JS inválido; `xxl` es la representación idiomática correcta. Documentar en ADR de tokens.

## Deferred from: code review of 1-8-eas-build-sentry-y-apk-observable-en-dispositivo-fisico (2026-06-03)

- `withoutCredentials: true` en perfil `staging` de `eas.json` sin comentario explicativo — permite distribuir APK sin firma en internal distribution; riesgo bajo dado que es staging, pero documentar la razón al momento de limpiar eas.json.
- ~~Smoke-test `Sentry.captureException(new Error('smoke-test'))` en `LoginScreen.tsx` se ejecuta en todos los entornos~~ — **RESUELTO 2026-06-05**: removido de `LoginScreen.tsx` y `LoginScreen.test.tsx` tras validación en Sentry dashboard.

## Deferred from: code review of 1-4-servicio-de-autenticacion-del-administrador (2026-06-03)

- Comparación de hash con `===` no es constant-time — timing attack teórico en `AdminAuthService.ts:36`; riesgo extremadamente bajo en contexto local on-device; no existe `timingSafeEqual` nativo en React Native/Hermes sin polyfill.
- `adminHash` sin validación de tipo en runtime — si el JSON tiene `adminHash: undefined/null`, el comportamiento es correcto (retorna `false`) pero sin guardia explícita; considerar añadir `typeof adminHash !== 'string'` check en futura revisión de hardening.
- Console spy en AC-AUTH-02 no cubre `console.info` / `console.debug` — la implementación actual no tiene ningún console call; gap teórico para futuros regresiones.
- `FileSystem.documentDirectory` puede ser `null` en Expo — el template literal produce `"nulladmin.config.json"`, `getInfoAsync` retorna `{ exists: false }` o lanza; el `catch` lo maneja correctamente.
- `digestStringAsync` retorna `undefined` por defecto en mock global — tests correctamente configuran el spy en cada caso; riesgo de tests futuros que olviden configurarlo.
- AC-AUTH-02 no ejercita el path de error (catch block) — el catch block actual solo tiene `return false`; gap de cobertura para regresiones futuras que añadan logging ahí.
- `getInfoAsync` mockeado con `as any` — suprime errores de tipo; considerar usar `Partial<FileSystem.FileInfo>` en futura mejora de tests.

## Deferred from: code review of 2-2-login-de-operador-y-navegacion-al-turno (2026-06-05)

- AuthRouter no verifica `activeShift` — teóricamente `pendingOperatorName` y `activeShift` podrían coexistir; no reproducible con el flujo actual; agregar guard si se añaden nuevas formas de setear `pendingOperatorName`. [src/presentation/navigation/RootNavigator.tsx:14]
- `pendingOperatorName` podría sobrevivir un retry de hydration si `resetInitialization()` no llama `resetPOSState` — verificar appSlice cuando se refactorice flujo de retry. [src/presentation/store/hydration/hydrateStore.ts]
- Usuario bloqueado en modo "turno activo" sin acción de escape — diseño intencional del spec; resolver en Epic 4a al agregar navegación al POS. [src/presentation/features/auth/LoginScreen.tsx:42]
- Cambio `activeShift` null→no-null mientras LoginScreen montada: estado local `name` se pierde — UX menor, benign. [src/presentation/features/auth/LoginScreen.tsx]
- `handleEnter` sin `useCallback` — rendimiento menor; evaluar cuando PrimaryButton use `React.memo`. [src/presentation/features/auth/LoginScreen.tsx:25]
- hydrateStore: `active_branch_id = ""` (string vacía) provoca limpieza silenciosa del branch configurado. [src/presentation/store/hydration/hydrateStore.ts:53]
- RootNavigator test: falta caso `activeBranch` set + `activeShift` no-null — agregar en próxima historia que toque AuthRouter. [src/presentation/navigation/__tests__/RootNavigator.test.tsx]
- (story 2.1) BranchSelectScreen: `useMemo` ignora `dbInstance` si `repository` prop también se provee. [BranchSelectScreen.tsx:44]
- (story 2.1) BranchSelectScreen: `loadBranches` dep inestable puede causar loop infinito con prop suministrada como objeto inline. [BranchSelectScreen.tsx:52]
- (story 2.1) BranchSelectScreen: flag `cancelled` no cancela async en vuelo — setState en componente desmontado. [BranchSelectScreen.tsx:103]
- (story 2.1) BranchSelectScreen: `NetInfo` listener se re-registra en cada cambio de `isLoading`/`branches.length`. [BranchSelectScreen.tsx:113]
- (story 2.1) BranchSelectScreen: `handleConfirmBranch` escribe a SQLite directamente, bypaseando repository. [BranchSelectScreen.tsx:132]
- (story 2.1) BranchSelectScreen: `item.id` (UUID) se muestra al usuario en la lista de sucursales. [BranchSelectScreen.tsx:177]
- (story 2.1) `toBranch()` en BranchSelectScreen duplica `toEntity()` de BranchRepository. [BranchSelectScreen.tsx:22]
- (story 2.1) BranchRepository.save: `created_at` en `onConflictDoUpdate` — timestamp de creación mutable en upsert. [BranchRepository.ts:48]
- (story 2.1) BranchRepository: métodos `async` sin `await` — wrappers síncronos con firma async. [BranchRepository.ts:40]
- (story 2.1) BranchRepository.test.ts: DB compartida a nivel de módulo, no aislada por test. [BranchRepository.test.ts:12]

## Deferred from: code review of 2-3-autenticacion-del-administrador-y-navegacion-admin (2026-06-05)

- `adminSalt` baked en JS bundle via `app.config.js` extra — decisión de diseño sistémica per spec (EAS Secret → Constants.expoConfig); salt accesible extrayendo el bundle del APK; mitigar en arquitectura futura si se requiere mayor hardening.
- Sin mecanismo de logout de admin — una vez `isAdminMode=true`, la única salida es `resetPOSState()` que borra todo el estado POS; un logout selectivo deberá implementarse en un epic posterior.
- Singleton `adminAuthService` captura salt en load time del módulo — by design per spec; hot-reload no reconstruye singletons de módulo, salt stale persiste hasta reload completo.
- `isAdminMode` no se resetea en `setActiveBranch` — no alcanzable via flujo de UI actual; agregar clear de `isAdminMode` en `setActiveBranch` cuando se implemente cambio de sucursal como feature.
- Estado inconsistente `isAdminMode: true` + `activeBranch: null` — no alcanzable via flujos actuales; agregar invariante de store cuando se implemente logout/cambio de sucursal.
- `admin.config.json` provisioning sin documentación ni herramienta de generación — un dev sin `ADMIN_SALT` y el hash correspondiente no puede probar el flujo admin; agregar script de setup en docs/tooling.
- `ProductosAdminScreen` compartida entre `AdminDrawer` y `OperatorDrawer` — stubs actualmente sin controles admin; revisar separación al implementar la pantalla real en Epic 3, según si operadores deben tener acceso diferenciado.

## Deferred from: code review of 2-4-hidratacion-inicial-de-sucursales-y-productos-desde-supabase (2026-06-05)

- React Strict Mode doble invocación sin mount guard en `InitializationGate.tsx` — guards internos de hydrateStore mitigan; patrón pre-existente.
- Sin cleanup en unmount durante `await hydrateIfNeeded` en `InitializationGate.tsx` — Zustand sobrevive desmontaje; patrón pre-existente.
- `withTransactionSync` silent non-commit (comportamiento teórico de expo-sqlite) en `InitialHydration.ts` — si ocurre, siguiente arranque reintenta hidratación.
- `active: null` de Supabase tratado como inactivo en `InitialHydration.ts` — depende de constraint NOT NULL en Supabase; TypeScript protege para datos conformes.
- `price_cents` CHECK violation rollbackea batch completo en `InitialHydration.ts` — comportamiento atómico correcto; edge case no documentado; un producto inválido bloquea toda la hidratación.
- `hydrateStore()` return value ignorado en `InitializationGate.tsx` — pre-existente; feedback vía Zustand store signal.

## Deferred from: code review of 2-1-modal-de-seleccion-de-sucursal-en-primer-uso (2026-06-05)

- Flag `cancelled` no cancela `loadBranches` en vuelo tras desmontaje de `BranchSelectScreen` — en React 18, setState en componente desmontado es no-op; bajo riesgo real. [src/presentation/features/auth/screens/BranchSelectScreen.tsx:95]
- `hydrateStore`: `delete()` de branch huérfano dentro de try-catch; si lanza, hidratación queda en estado ERROR permanente — Drizzle delete no lanza en cero rows; riesgo extremadamente bajo. [src/presentation/store/hydration/hydrateStore.ts:51]
- Auto-retry NetInfo: cierre stale en efecto puede disparar `loadBranches` doble al reconectar — guard `isLoading` es funcional en práctica; reproducción muy difícil. [src/presentation/features/auth/screens/BranchSelectScreen.tsx:109]
- `handleConfirmBranch` usa `dbInstance` prop; `hydrateStore` usa `defaultDb` — inconsistencia visible solo en tests de integración completos (full flow screen → restart → hydration). [src/presentation/features/auth/screens/BranchSelectScreen.tsx:128]
- Mensaje "No se encontraron sucursales disponibles." no está en spec — estado extra cuando Supabase retorna lista vacía sin error; mejora UX no documentada. [src/presentation/features/auth/screens/BranchSelectScreen.tsx:65]
- `BranchRepository.save()` incluye `created_at` en `onConflictDoUpdate` — sobreescribe timestamp de creación en upsert; en práctica Supabase devuelve el mismo valor. [src/infrastructure/repositories/BranchRepository.ts:44]
- `BranchSelectScreen` importa infraestructura directamente (`BranchRepository`, `db`, `schema`) — concern arquitectural de capas; DI vía props preserva testabilidad. Refactor en épica posterior si se introduce inyección de dependencias formal. [src/presentation/features/auth/screens/BranchSelectScreen.tsx:5]

## Deferred from: code review of 3-2-crear-y-editar-productos (2026-06-08)

- `async save()` en `ProductRepository` usa `.run()` síncrono sin `await` — mismo patrón que `BranchRepository` y resto del codebase; Drizzle sync API para SQLite. No introducido en esta historia. [src/infrastructure/repositories/ProductRepository.ts:63]
- Sin indicador de carga durante re-fetch en `useFocusEffect` de `ProductListScreen` — patrón pre-existente; la lista muestra datos stale brevemente al volver del formulario. [src/presentation/features/products/screens/ProductListScreen.tsx:19]
- Race condition teórico de doble-tap en `handleSave` — el guard `saving` no es atómico; en práctica React batching y UX lo mitigan. [src/presentation/features/products/screens/ProductFormScreen.tsx:70]
- `active: true` hardcodeado en `SaveProductUseCase` — por diseño; la desactivación de productos es scope exclusivo de Story 3.3; `onConflictDoUpdate` correctamente omite `active`. [src/application/products/SaveProductUseCase.ts:50]

## Deferred from: code review of 3-1-listar-y-buscar-productos-del-catalogo (2026-06-05)

- `activeBranch` type safety — undefined/empty string del store se trata como null sin advertencia; el ternario `branchId ? ... : sql\`0 = 1\`` silencia silenciosamente ambos casos. [src/presentation/features/products/screens/ProductListScreen.tsx:14]
- No loading state — la lista muestra `<EmptyState variant="PRODUCTS" />` brevemente antes de que los datos lleguen del repositorio, dando una señal falsa de "no hay productos". [src/presentation/features/products/screens/ProductListScreen.tsx:18-19]
- ProductRow.cost\_cents typing — si `ProductRow` tipifica `cost_cents` como `number` (no nullable), el mapeo `costCents: row.cost_cents` silencia nulls de DB como 0 sin error de compilación. [src/infrastructure/repositories/ProductRepository.ts:13]
- formatDate con ISO inválido — `new Date("garbage")` produce `Invalid Date`; `Intl.DateTimeFormat.format()` lanza `RangeError` en Hermes; `createdAt` no tiene validación antes de llegar a `formatDate`. [src/presentation/utils/format.ts:9]
- Intl en Hermes — primera aparición de `Intl.NumberFormat` y `Intl.DateTimeFormat` en el proyecto; builds con Hermes antiguo o sin ICU completo pueden lanzar `RangeError`; verificar soporte o agregar polyfill. [src/presentation/utils/format.ts:1-14]
- Sort tie-breaking no determinístico — dos productos con el mismo `sort_order` y el mismo `created_at` tienen orden indefinido entre sí; SQLite no garantiza estabilidad más allá de las columnas del ORDER BY. [src/infrastructure/repositories/ProductRepository.ts:44-47]
- priceCents negativo — la entidad `Product` no valida `priceCents >= 0`; un valor negativo (dato corrupto de sync) se renderiza como precio negativo sin ninguna advertencia. [src/domain/entities/Product.ts:4]
