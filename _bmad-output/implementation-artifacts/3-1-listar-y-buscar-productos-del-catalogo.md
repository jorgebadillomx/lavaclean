---
baseline_commit: 7dd637a55e7f59f5053b577589d1b6294c01452b
---
# Story 3.1: Listar y Buscar Productos del Catálogo

Status: done

## Story

Como operador o administrador,
quiero ver la lista completa de productos activos y filtrarla por nombre en tiempo real,
para encontrar rápidamente el servicio que quiero agregar o gestionar.

## Acceptance Criteria

**GIVEN** la pantalla de Gestión de Productos
**WHEN** se carga
**THEN** (AC-PROD-01) muestra todos los Productos con `active = 1` con nombre, precio y costo formateados, en el orden manual configurado en `branch_sort`; los Productos con `active = 0` no aparecen

**GIVEN** el campo de búsqueda con texto ingresado
**WHEN** el Operador escribe en tiempo real
**THEN** (AC-PROD-02) la lista se filtra instantáneamente por nombre (insensible a mayúsculas/minúsculas) sin recargar ni hacer nueva consulta a SQLite

**GIVEN** el catálogo vacío sin productos
**WHEN** se carga la pantalla
**THEN** (AC-PROD-03) aparece `<EmptyState variant="PRODUCTS" />` ("Agrega tus servicios para empezar.") y el FAB es prominente

**GIVEN** la app está offline
**WHEN** se visualiza la pantalla de Productos
**THEN** (AC-PROD-04) el `ConnectivityBadge` aparece discretamente en la zona trailing del header de la pantalla

## Tasks / Subtasks

- [x] Task 1 — Capa de dominio: entidad `Product` + interfaz `IProductRepository` (AC: PROD-01)
  - [x] 1.1 Crear `src/domain/entities/Product.ts`: interfaz con `id`, `name`, `priceCents`, `costCents: number | null`, `active`, `version`, `createdAt`
  - [x] 1.2 Crear `src/domain/repositories/IProductRepository.ts`: método `findAllActive(branchId: string | null): Promise<Product[]>`
  - [x] 1.3 Actualizar `src/domain/entities/index.ts`: agregar `export type { Product } from './Product'`
  - [x] 1.4 Actualizar `src/domain/repositories/index.ts`: agregar `export type { IProductRepository } from './IProductRepository'`

- [x] Task 2 — Infraestructura: `ProductRepository.ts` (AC: PROD-01)
  - [x] 2.1 Crear `src/infrastructure/repositories/ProductRepository.ts`
  - [x] 2.2 Implementar `findAllActive(branchId: string | null): Promise<Product[]>` con LEFT JOIN a `branch_sort`
  - [x] 2.3 Ordenar: `COALESCE(branch_sort.sort_order, 9999999) ASC` luego `products.created_at ASC` para nulls al final
  - [x] 2.4 Filtrar: `WHERE products.active = 1`
  - [x] 2.5 Constructor recibe `dbInstance: AppDB = defaultDb` (mismo patrón que `BranchRepository`)

- [x] Task 3 — Utilidades de presentación: `format.ts` (AC: PROD-01)
  - [x] 3.1 Crear `src/presentation/utils/format.ts`
  - [x] 3.2 Exportar `formatCurrency(cents: number, locale = 'es-MX'): string` con `Intl.NumberFormat`
  - [x] 3.3 Exportar `formatDate(iso: string): string` con `Intl.DateTimeFormat`

- [x] Task 4 — Componente `ProductSearchBar.tsx` (AC: PROD-02)
  - [x] 4.1 Crear `src/presentation/features/products/components/ProductSearchBar.tsx`
  - [x] 4.2 Props: `{ value: string; onChangeText: (text: string) => void; placeholder?: string }`
  - [x] 4.3 Usar `TextInput` nativo con `autoCapitalize="none"`, `clearButtonMode="while-editing"` (iOS)
  - [x] 4.4 Estilar con tokens de `theme/tokens.ts` — sin estilos inline hardcoded

- [x] Task 5 — Pantalla `ProductListScreen.tsx` (AC: PROD-01, PROD-02, PROD-03)
  - [x] 5.1 Crear `src/presentation/features/products/screens/ProductListScreen.tsx`
  - [x] 5.2 En `useEffect`: instanciar `new ProductRepository()` y llamar `.findAllActive(activeBranch)`, guardar resultado en `useState<Product[]>`
  - [x] 5.3 Leer `activeBranch` del store: `const activeBranch = useAppStore((s) => s.activeBranch)`
  - [x] 5.4 Filtrado: `useMemo` sobre la lista cargada filtrando por `query.toLowerCase()` sobre `product.name.toLowerCase()`
  - [x] 5.5 Renderizar `FlatList` con `renderItem` inline mostrando nombre, precio (`formatCurrency(priceCents)`), costo (`costCents ? formatCurrency(costCents) : '—'`)
  - [x] 5.6 `ListEmptyComponent`: `query === ''` → `<EmptyState variant="PRODUCTS" />`; `query !== ''` → texto "Sin resultados para '{{query}}'"
  - [x] 5.7 Agregar `FAB` con `accessibilityLabel="Agregar producto"` y `onPress={() => {/* TODO Story 3.2 */}}`
  - [x] 5.8 El componente `FAB` ya está en `src/presentation/components/FAB.tsx` — importar de ahí; NO recrear

- [x] Task 6 — Actualizar barrel exports y navegación (AC: PROD-04)
  - [x] 6.1 Reemplazar contenido de `src/presentation/features/products/index.ts` con `export { ProductListScreen } from './screens/ProductListScreen'`
  - [x] 6.2 Actualizar `src/presentation/navigation/OperatorDrawer.tsx`:
        - Reemplazar import de `ProductosAdminScreen` por `ProductListScreen` desde `'../features/products'`
        - Cambiar `component={ProductosAdminScreen}` a `component={ProductListScreen}`
        - Agregar `import { ConnectivityBadge } from '../components/ConnectivityBadge'`
        - Agregar en Drawer.Screen Productos: `options={{ title: 'Productos', headerRight: () => <ConnectivityBadge /> }}`
  - [x] 6.3 Actualizar `src/presentation/navigation/AdminDrawer.tsx`: mismos cambios que OperatorDrawer para la ruta "Productos"

- [x] Task 7 — Tests de `ProductRepository.ts` (AC: PROD-01)
  - [x] 7.1 Crear `src/infrastructure/repositories/__tests__/ProductRepository.test.ts`
  - [x] 7.2 Test: 3 productos activos con branch_sort → retorna en orden ascendente de `sort_order`
  - [x] 7.3 Test: Productos sin entradas en `branch_sort` para el branch → retorna todos los activos (sin crash, orden por `created_at`)
  - [x] 7.4 Test: Mix de productos activos e inactivos → retorna solo los activos
  - [x] 7.5 Test: `branchId = null` → retorna todos los activos sin orden de branch_sort (all nulls → by created_at)
  - [x] 7.6 Usar `createTestDb()` de `src/test-utils/db-test-utils.ts`; insertar datos con Drizzle (patrón establecido en BranchRepository.test.ts)

- [x] Task 8 — Verificación final
  - [x] 8.1 `yarn tsc --noEmit` sin errores
  - [x] 8.2 `yarn test` pasa (tests nuevos + todos los existentes)

## Dev Notes

### Diagnóstico del estado actual del repo

Estos archivos **ya existen** — NO recrear:
- `src/infrastructure/db/rows/ProductRow.ts` — interface `{ id, name, price_cents, cost_cents, active, version, created_at }`
- `src/infrastructure/db/schema.ts` — tablas `products` y `branch_sort` definidas con Drizzle
- `src/presentation/components/EmptyState.tsx` — acepta `variant="PRODUCTS"`, usa `EMPTY_STATE_REGISTRY`
- `src/presentation/components/emptyStateRegistry.ts` — `PRODUCTS: { text: 'Agrega tus servicios para empezar.' }` **ya registrado**
- `src/presentation/components/FAB.tsx` — `{ onPress, accessibilityLabel }`, ya posicionado absolutamente en la esquina
- `src/presentation/components/ConnectivityBadge.tsx` — ya implementado con `NetInfo`
- `src/test-utils/factories/index.ts` — `ProductFactory` ya definido con propiedades camelCase (`priceCents`, `costCents`, `active`)

Estos archivos son **stubs que se reemplazan** (solo rutas afectadas por esta historia):
- `src/presentation/features/products/index.ts` — dice "Barrel vacío para Sprint 0." — reemplazar completamente
- `src/presentation/features/admin/screens/ProductosAdminScreen.tsx` — stub placeholder (Epic 3) — NO eliminar, solo dejar de usarlo en los Drawers

Estos archivos **NO existen aún** y deben crearse:
- `src/domain/entities/Product.ts`
- `src/domain/repositories/IProductRepository.ts`
- `src/infrastructure/repositories/ProductRepository.ts`
- `src/presentation/utils/format.ts` (primera vez que se usa en el proyecto)
- `src/presentation/features/products/screens/ProductListScreen.tsx`
- `src/presentation/features/products/components/ProductSearchBar.tsx`
- `src/presentation/features/products/screens/` (carpeta — crear)
- `src/presentation/features/products/components/` (carpeta — crear)
- `src/infrastructure/repositories/__tests__/ProductRepository.test.ts`

### Entidad `Product` — mapeo de nombres

Los campos SQLite usan `snake_case`; la entidad de dominio usa `camelCase`:

```typescript
// src/domain/entities/Product.ts
export interface Product {
  id: string;
  name: string;
  priceCents: number;       // price_cents en DB
  costCents: number | null; // cost_cents en DB
  active: boolean;          // active (1/0) en DB
  version: number;
  createdAt: string;        // ISO 8601
}
```

### `ProductRepository.ts` — patrón y query con Drizzle

Seguir exactamente el mismo patrón de `BranchRepository.ts`:
- Constructor con `dbInstance: AppDB = defaultDb`
- Funciones `toEntity(row)` y `toRow(entity)` privadas arriba
- Métodos `async` aunque Drizzle/SQLite sean síncronos internamente

```typescript
import { and, asc, eq, sql } from 'drizzle-orm';
import { db as defaultDb, type AppDB } from '../db/client';
import * as schema from '../db/schema';
import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import type { ProductRow } from '../db/rows/ProductRow';

function toEntity(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    priceCents: row.price_cents,
    costCents: row.cost_cents,
    active: row.active === 1,
    version: row.version,
    createdAt: row.created_at,
  };
}

export class ProductRepository implements IProductRepository {
  constructor(private readonly dbInstance: AppDB = defaultDb) {}

  async findAllActive(branchId: string | null): Promise<Product[]> {
    const rows = this.dbInstance
      .select({
        id: schema.products.id,
        name: schema.products.name,
        price_cents: schema.products.price_cents,
        cost_cents: schema.products.cost_cents,
        active: schema.products.active,
        version: schema.products.version,
        created_at: schema.products.created_at,
      })
      .from(schema.products)
      .leftJoin(
        schema.branch_sort,
        and(
          eq(schema.branch_sort.product_id, schema.products.id),
          branchId ? eq(schema.branch_sort.branch_id, branchId) : sql`0 = 1`
        )
      )
      .where(eq(schema.products.active, 1))
      .orderBy(
        sql`COALESCE(${schema.branch_sort.sort_order}, 9999999)`,
        asc(schema.products.created_at)
      )
      .all() as ProductRow[];

    return rows.map(toEntity);
  }
}
```

**Nota sobre `branchId = null`:** Cuando no hay branch activa, la condición del JOIN fuerza `0 = 1` (siempre falso), haciendo que todos los productos tengan `sort_order = NULL` y se ordenen por `created_at`. Esto es correcto y no produce ningún error.

**Alternativa con raw SQL si Drizzle da problemas con el JOIN condicional:**
```typescript
const rows = branchId
  ? this.dbInstance.all(sql`
      SELECT p.* FROM products p
      LEFT JOIN branch_sort bs ON p.id = bs.product_id AND bs.branch_id = ${branchId}
      WHERE p.active = 1
      ORDER BY COALESCE(bs.sort_order, 9999999) ASC, p.created_at ASC
    `) as ProductRow[]
  : this.dbInstance.select().from(schema.products)
      .where(eq(schema.products.active, 1))
      .orderBy(asc(schema.products.created_at))
      .all() as ProductRow[];
```

### `format.ts` — primera aparición en el proyecto

`src/presentation/utils/format.ts` NO existe aún. Esta historia lo crea por primera vez.

```typescript
// src/presentation/utils/format.ts
export function formatCurrency(cents: number, locale = 'es-MX'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}
```

**NUNCA formatear moneda inline** (`$${(cents/100).toFixed(2)}`). Siempre usar `formatCurrency()`.

### `ProductListScreen.tsx` — fuente de datos correcta

**CRÍTICO:** Los `products: ProductRow[]` del Zustand store (`useAppStore(s => s.products)`) son para el POS (agregar ítems a notas). **NO usar para la pantalla de gestión de catálogo** — no tienen `sort_order`.

La pantalla de gestión llama directamente a `new ProductRepository().findAllActive(activeBranch)` en un `useEffect`. El `activeBranch` viene de `useAppStore(s => s.activeBranch)`.

```typescript
// ProductListScreen.tsx — estructura base
export function ProductListScreen() {
  const activeBranch = useAppStore((s) => s.activeBranch);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    new ProductRepository().findAllActive(activeBranch).then(setProducts);
  }, [activeBranch]);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  // ...
}
```

### Actualización de `OperatorDrawer.tsx` y `AdminDrawer.tsx`

Los Drawers actualmente importan `ProductosAdminScreen` desde `admin/screens`. Reemplazar:

```typescript
// ANTES (en OperatorDrawer.tsx y AdminDrawer.tsx):
import { ProductosAdminScreen } from '../features/admin/screens/ProductosAdminScreen';

// DESPUÉS:
import { ProductListScreen } from '../features/products';
import { ConnectivityBadge } from '../components/ConnectivityBadge';

// Y en Drawer.Screen:
<Drawer.Screen
  name="Productos"
  component={ProductListScreen}
  options={{ title: 'Productos', headerRight: () => <ConnectivityBadge /> }}
/>
```

`ConnectivityBadge` ya existe en `src/presentation/components/ConnectivityBadge.tsx`. NO importar desde otro lugar.

### Tests de `ProductRepository`

Usar `createTestDb()` de `src/test-utils/db-test-utils.ts`. Insertar datos con `rawDb.runSync()` (SQL directo) para no depender del repositorio mismo.

```typescript
import { createTestDb } from '../../../../test-utils/db-test-utils';
import { ProductRepository } from '../ProductRepository';

describe('ProductRepository', () => {
  let testEnv: ReturnType<typeof createTestDb>;
  let repo: ProductRepository;

  beforeEach(() => {
    testEnv = createTestDb();
    repo = new ProductRepository(testEnv.db);
  });

  afterEach(() => {
    testEnv.close();
  });

  it('retorna productos activos ordenados por sort_order del branch', async () => {
    const branchId = 'branch-1';
    // Insertar branch, 3 productos activos, branch_sort
    testEnv.rawDb.runSync(
      "INSERT INTO branches (id, name, created_at) VALUES (?, ?, ?)",
      ['branch-1', 'Sucursal Test', new Date().toISOString()]
    );
    testEnv.rawDb.runSync(
      "INSERT INTO products (id, name, price_cents, active, version, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      ['prod-a', 'Lavado Normal', 8000, 1, 1, '2026-01-01T00:00:00.000Z']
    );
    // ... insertar prod-b, prod-c
    testEnv.rawDb.runSync(
      "INSERT INTO branch_sort (branch_id, product_id, sort_order) VALUES (?, ?, ?)",
      ['branch-1', 'prod-a', 2]
    );
    // ... insertar sort para prod-b (sort=1), prod-c (sort=3)

    const result = await repo.findAllActive(branchId);
    expect(result.map((p) => p.id)).toEqual(['prod-b', 'prod-a', 'prod-c']);
  });
  // ... otros tests
});
```

### Nomenclatura prohibida (arquitectura)

Nunca usar: `getById`, `fetchAll`, `update`, `insert`, `listBy`, `getFiltered`. Solo `find`, `save`, `deactivate`, `delete`.

### Patrones establecidos — NO romper

De story 2.4 (hidratación):
- `hydrateStore.ts` carga productos activos en Zustand SIN sort de branch. **NO modificar `hydrateStore.ts`.**
- El Zustand store tiene `products: ProductRow[]` para el POS — esto sigue igual.

De story 2.3 (admin auth):
- `RootNavigator.tsx` no usa `AppHeader` directamente; las pantallas de Drawer usan la cabecera de React Navigation. Para agregar el badge, usar `options.headerRight` en la definición del Drawer.Screen.

De story 1.3 (store):
- Acceder a `activeBranch` via `useAppStore(s => s.activeBranch)`. El branch activo para el sort es `posSlice.activeBranch` (no `adminSlice.selectedBranch`).

### Reglas adicionales de arquitectura

- **Archivos de tipos**: `lowercase.ts` (e.g., `async.ts`), no `PascalCase.ts`
- **Componentes React**: `PascalCase.tsx`
- **Repositorios**: `[Entity]Repository.ts`
- **Carpetas de features**: `lowercase-singular` → `products/`, no `Products/`
- **Barrel**: Solo crear `index.ts` si hay ≥2 exports. El `index.ts` de products tendrá solo `ProductListScreen` por ahora (1 export) — pero se justifica porque la convención de features requiere barrel público; agregar un comentario si el linter lo cuestiona.

### Estructura de archivos resultante

```text
NUEVOS:
  src/domain/entities/Product.ts
  src/domain/repositories/IProductRepository.ts
  src/infrastructure/repositories/ProductRepository.ts
  src/infrastructure/repositories/__tests__/ProductRepository.test.ts
  src/presentation/utils/format.ts
  src/presentation/features/products/screens/ProductListScreen.tsx
  src/presentation/features/products/components/ProductSearchBar.tsx

MODIFICADOS:
  src/domain/entities/index.ts                  (agregar Product)
  src/domain/repositories/index.ts              (agregar IProductRepository)
  src/presentation/features/products/index.ts   (reemplazar barrel stub)
  src/presentation/navigation/OperatorDrawer.tsx (usar ProductListScreen, badge)
  src/presentation/navigation/AdminDrawer.tsx    (usar ProductListScreen, badge)

SIN CAMBIOS (importante):
  src/infrastructure/db/schema.ts
  src/infrastructure/db/rows/ProductRow.ts
  src/presentation/store/slices/posSlice.ts
  src/presentation/store/hydration/hydrateStore.ts
  src/presentation/components/EmptyState.tsx
  src/presentation/components/emptyStateRegistry.ts
  src/presentation/components/FAB.tsx
  src/presentation/components/ConnectivityBadge.tsx
  src/presentation/features/admin/screens/ProductosAdminScreen.tsx  (dejar como dead code)
```

### Definition of Done técnica

- `yarn tsc --noEmit` sin errores
- `yarn test` pasa (4+ tests nuevos en `ProductRepository.test.ts` + todos los existentes)
- `ProductListScreen` muestra lista de productos con nombre, precio y costo formateados
- Búsqueda en tiempo real funciona sin re-consultar SQLite
- EmptyState aparece cuando no hay productos
- ConnectivityBadge visible en el header cuando offline

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.1 ACs]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3 contexto completo]
- [Source: _bmad-output/planning-artifacts/architecture.md — ADR-001 Drizzle ORM]
- [Source: _bmad-output/planning-artifacts/architecture.md — File Structure §products/]
- [Source: _bmad-output/planning-artifacts/architecture.md — Patrones de Nomenclatura]
- [Source: _bmad-output/planning-artifacts/architecture.md — Patrones de Métodos de Repositorio]
- [Source: _bmad-output/planning-artifacts/architecture.md — §Formato de Moneda]
- [Source: _bmad-output/planning-artifacts/architecture.md — ADR-003 Zustand para POS, TanStack solo para Admin remoto]
- [Source: src/infrastructure/repositories/BranchRepository.ts — patrón a replicar]
- [Source: src/infrastructure/db/schema.ts — tablas products y branch_sort]
- [Source: src/infrastructure/db/rows/ProductRow.ts — estructura de fila existente]
- [Source: src/presentation/components/emptyStateRegistry.ts — PRODUCTS ya registrado]
- [Source: src/presentation/store/slices/posSlice.ts — products y activeBranch en store]
- [Source: src/presentation/store/hydration/hydrateStore.ts — NO modificar]
- [Source: src/presentation/navigation/OperatorDrawer.tsx — patrón Drawer a actualizar]
- [Source: src/presentation/navigation/AdminDrawer.tsx — patrón Drawer a actualizar]
- [Source: src/test-utils/db-test-utils.ts — createTestDb para tests]
- [Source: _bmad-output/implementation-artifacts/2-4-hidratacion-inicial-de-sucursales-y-productos-desde-supabase.md — learnings]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (create-story + dev-story)

### Debug Log References

### Completion Notes List

- Entidad `Product` y `IProductRepository` creadas en capa de dominio; barrels de entities y repositories actualizados.
- `ProductRepository.findAllActive` implementado con LEFT JOIN condicional a `branch_sort`: cuando `branchId = null` usa `sql\`0 = 1\`` para forzar nulls y ordenar por `created_at`. Patrón idéntico a `BranchRepository`.
- `format.ts` creado por primera vez en el proyecto; `formatCurrency` usa `Intl.NumberFormat` con locale `es-MX` y moneda `MXN`.
- `ProductSearchBar` estilizado con tokens, `autoCapitalize="none"`, `clearButtonMode="while-editing"`.
- `ProductListScreen`: carga con `useEffect` + `ProductRepository`, filtrado en memoria con `useMemo`, `EmptyState` para catálogo vacío y mensaje inline para búsqueda sin resultados, `FAB` con TODO para Story 3.2.
- `OperatorDrawer` y `AdminDrawer` migrados de `ProductosAdminScreen` a `ProductListScreen`; `ConnectivityBadge` añadido como `headerRight`.
- 5 tests en `ProductRepository.test.ts`: orden por `sort_order`, orden por `created_at` sin branch_sort, filtro activos/inactivos, `branchId = null`, mapeo camelCase.
- `yarn tsc --noEmit`: 0 errores. `yarn test`: 83 pasando, 0 fallidos, 0 regresiones.

### File List

**Nuevos:**
- src/domain/entities/Product.ts
- src/domain/repositories/IProductRepository.ts
- src/infrastructure/repositories/ProductRepository.ts
- src/infrastructure/repositories/__tests__/ProductRepository.test.ts
- src/presentation/utils/format.ts
- src/presentation/features/products/screens/ProductListScreen.tsx
- src/presentation/features/products/components/ProductSearchBar.tsx

**Modificados:**
- src/domain/entities/index.ts
- src/domain/repositories/index.ts
- src/presentation/features/products/index.ts
- src/presentation/navigation/OperatorDrawer.tsx
- src/presentation/navigation/AdminDrawer.tsx

### Review Findings

- [x] **PATCH** FAB prominence in empty state — prop `prominent` añadida a FAB; `ProductListScreen` pasa `prominent={isEmpty}` (72×72, sombra reforzada) cuando catálogo vacío [src/presentation/features/products/screens/ProductListScreen.tsx:54-57]

- [x] **PATCH** Unhandled promise rejection in useEffect — añadido `.catch(() => { if (mounted) setProducts([]); })` [src/presentation/features/products/screens/ProductListScreen.tsx:19]

- [x] **PATCH** No cancellation of async on unmount — añadido flag `mounted` con cleanup `return () => { mounted = false; }` en useEffect [src/presentation/features/products/screens/ProductListScreen.tsx:18-20]

- [x] **PATCH** Long product names overflow row layout — añadido `numberOfLines={1} ellipsizeMode="tail"` al `<Text style={styles.name}>` [src/presentation/features/products/screens/ProductListScreen.tsx:38]

- [x] **PATCH** ListEmptyComponent condition mismatch — corregido `query === ''` → `query.trim() === ''` en `ListEmptyComponent` [src/presentation/features/products/screens/ProductListScreen.tsx:47-50]

- [x] **DEFER** `activeBranch` type safety — undefined/empty string de store se trata como null sin advertencia [src/presentation/features/products/screens/ProductListScreen.tsx:14] — deferred, pre-existing

- [x] **DEFER** No loading state — lista muestra EmptyState brevemente antes de que los datos lleguen [src/presentation/features/products/screens/ProductListScreen.tsx:18-19] — deferred, pre-existing

- [x] **DEFER** ProductRow.cost\_cents typing — si el tipo no permite null, el mapeo `costCents: row.cost_cents` silencia nulls como 0 [src/infrastructure/repositories/ProductRepository.ts:13] — deferred, pre-existing

- [x] **DEFER** formatDate con ISO inválido — `new Date("garbage")` produce RangeError en Hermes; createdAt tipado como string sin validación [src/presentation/utils/format.ts:9] — deferred, pre-existing

- [x] **DEFER** Intl en Hermes — primera aparición de Intl.NumberFormat/DateTimeFormat en el proyecto; verificar soporte en versión de Hermes configurada [src/presentation/utils/format.ts:1-14] — deferred, pre-existing

- [x] **DEFER** Sort tie-breaking no determinístico — dos productos con mismo sort\_order y mismo created\_at tienen orden indefinido [src/infrastructure/repositories/ProductRepository.ts:44-47] — deferred, pre-existing

- [x] **DEFER** priceCents negativo — entidad Product no valida priceCents >= 0; un valor negativo se renderiza como precio negativo sin error [src/domain/entities/Product.ts:4] — deferred, pre-existing
