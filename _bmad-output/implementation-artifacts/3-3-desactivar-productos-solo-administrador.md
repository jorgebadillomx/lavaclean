---
baseline_commit: df5aedc
---
# Story 3.3: Desactivar Productos (Solo Administrador)

Status: done

## Story

Como administrador,
quiero poder desactivar productos que ya no están disponibles,
para que dejen de aparecer en el POS sin perder el historial de notas que los referenciaban.

## Acceptance Criteria

**GIVEN** el formulario de un Producto en modo Administrador
**WHEN** se revisa el contenido
**THEN** (AC-PROD3-01) hay un botón "Desactivar" visible — el Operador **no** ve este botón

**GIVEN** el Administrador toca "Desactivar"
**WHEN** el diálogo de confirmación aparece
**THEN** (AC-PROD3-02) muestra "¿Desactivar este producto? Dejará de aparecer en el POS." con botones "Cancelar" y "Sí, desactivar"

**GIVEN** el Producto **está en Notas abiertas** en ese momento
**WHEN** el Administrador confirma la desactivación
**THEN** (AC-PROD3-03) la app muestra advertencia informativa pero permite continuar; el Producto desactivado permanece en esas Notas abiertas hasta que se cobren o cancelen

**GIVEN** un Producto desactivado en SQLite
**WHEN** se consulta la lista de Productos o el catálogo del POS
**THEN** (AC-PROD3-04) el Producto **no** aparece en ninguna lista activa; las Notas históricas muestran `product_name_snapshot` y `unit_price_cents` originales sin depender del estado actual del Producto

## Tasks / Subtasks

- [x] Task 1 — Extender `IProductRepository` con `deactivate()` y `hasOpenNoteItems()` (AC: PROD3-01, PROD3-03, PROD3-04)
  - [x] 1.1 En `src/domain/repositories/IProductRepository.ts`: agregar `deactivate(id: string): Promise<void>` (soft delete — solo donde aplique, per patrón de repositorio)
  - [x] 1.2 Agregar `hasOpenNoteItems(productId: string): Promise<boolean>` — consulta si el producto está en alguna Nota con `status = 'open'`

- [x] Task 2 — Implementar `ProductRepository.deactivate()` y `hasOpenNoteItems()` (AC: PROD3-03, PROD3-04)
  - [x] 2.1 `deactivate(id)`: UPDATE `products SET active = 0, version = version + 1 WHERE id = ?` usando `this.dbInstance.update(schema.products).set({ active: 0, version: sql\`${schema.products.version} + 1\` }).where(eq(schema.products.id, id)).run()`
  - [x] 2.2 `hasOpenNoteItems(productId)`: `SELECT note_items.id FROM note_items INNER JOIN notes ON note_items.note_id = notes.id WHERE note_items.product_id = ? AND notes.status = 'open' LIMIT 1` — retorna `rows.length > 0`
  - [x] 2.3 Agregar importación de `update` de drizzle si hace falta — en realidad `update` es método del `dbInstance`, no hace falta import extra

- [x] Task 3 — Crear `DeactivateProductUseCase.ts` (AC: PROD3-03, PROD3-04)
  - [x] 3.1 Crear `src/application/products/DeactivateProductUseCase.ts`
  - [x] 3.2 Constructor: `(productRepo: IProductRepository = new ProductRepository(), db: AppDB = defaultDb)`
  - [x] 3.3 Método `execute(productId: string): Promise<void>`
  - [x] 3.4 Validación: `findById(productId)` — lanzar `Error('product_not_found')` si no existe; lanzar `Error('product_already_inactive')` si `!product.active`
  - [x] 3.5 Llamar `productRepo.deactivate(productId)` — SQLite primero
  - [x] 3.6 Enqueue outbox después de confirmar SQLite: `entity_type: 'product'`, `operation: 'UPDATE'`, `payload: JSON.stringify({ ...product, active: false, version: product.version + 1 })`, `idempotency_key: \`product-deactivate-${productId}\``
  - [x] 3.7 La verificación de `hasOpenNoteItems()` es responsabilidad de la **UI** (antes de mostrar el diálogo), no del UseCase — el UseCase desactiva incondicionalmente si el producto existe y está activo

- [x] Task 4 — Actualizar `ProductFormScreen.tsx` con botón "Desactivar" (AC: PROD3-01, PROD3-02, PROD3-03)
  - [x] 4.1 Importar `useAppStore` desde `'../../../store'`
  - [x] 4.2 Leer `const isAdminMode = useAppStore((s) => s.isAdminMode)` y `const [product, setProduct] = useState<Product | null>(null)` para guardar el producto cargado en edición
  - [x] 4.3 En el `useEffect` de carga de producto existente: actualizar `setProduct(p)` además de los campos de texto
  - [x] 4.4 Renderizar botón "Desactivar" solo cuando `isAdminMode && productId && product?.active === true`
  - [x] 4.5 `handleDeactivate`: async, llama `new ProductRepository().hasOpenNoteItems(productId)`, luego `Alert.alert()` con mensaje según resultado — ver sección Dev Notes para el copy exacto
  - [x] 4.6 `onPress` del botón destructivo en el Alert: llamar `new DeactivateProductUseCase().execute(productId)`, luego `navigation.goBack()`
  - [x] 4.7 Estilar botón con `Colors.error` o similar de tokens — botón secundario/outline, no `PrimaryButton`; debe ser visualmente distinguible del botón "Guardar"

- [x] Task 5 — Tests de `ProductRepository.deactivate()` y `hasOpenNoteItems()` (AC: PROD3-04)
  - [x] 5.1 Agregar al archivo existente `src/infrastructure/repositories/__tests__/ProductRepository.test.ts`
  - [x] 5.2 Test `deactivate()` — producto activo: llamar deactivate, luego `findAllActive(null)` no lo retorna; `findById()` retorna `active: false`; versión incrementada
  - [x] 5.3 Test `deactivate()` — product que no existe: NO debe lanzar (es un UPDATE; si no hay rows afectadas, simplemente no pasa nada — la validación de existencia está en el UseCase)
  - [x] 5.4 Test `hasOpenNoteItems()` — sin notas: retorna `false`
  - [x] 5.5 Test `hasOpenNoteItems()` — con nota open que contiene el producto: retorna `true` (requiere insertar branch, shift, note, note_item en el testDb)
  - [x] 5.6 Test `hasOpenNoteItems()` — con nota closed/cancelled: retorna `false`

- [x] Task 6 — Tests de `DeactivateProductUseCase` (AC: PROD3-03, PROD3-04)
  - [x] 6.1 Crear `src/application/products/__tests__/DeactivateProductUseCase.test.ts`
  - [x] 6.2 Test: lanza `product_not_found` si `findById` retorna null
  - [x] 6.3 Test: lanza `product_already_inactive` si producto tiene `active: false`
  - [x] 6.4 Test: llama `deactivate(id)` y encola outbox con `operation: 'UPDATE'` y payload con `active: false`
  - [x] 6.5 Mockear `productRepo` con `findById`, `save`, `deactivate`, `hasOpenNoteItems` como jest.fn()
  - [x] 6.6 Mockear `db` con spy en `insert` (mismo patrón de `SaveProductUseCase.test.ts`)

- [x] Task 7 — Verificación final
  - [x] 7.1 `yarn tsc --noEmit` sin errores
  - [x] 7.2 `yarn test` pasa — todos los tests existentes + nuevos

## Dev Notes

### Estado actual del repo (baseline: commit `df5aedc`)

**Ya existen — NO recrear:**
- `src/domain/entities/Product.ts` — `{ id, name, priceCents, costCents, active: boolean, version, createdAt }`
- `src/domain/repositories/IProductRepository.ts` — tiene `findAllActive`, `findById`, `save`; **agregar** `deactivate` y `hasOpenNoteItems`
- `src/infrastructure/repositories/ProductRepository.ts` — tiene `findAllActive`, `findById`, `save`; **agregar** `deactivate` y `hasOpenNoteItems`
- `src/infrastructure/db/schema.ts` — tablas `products`, `note_items`, `notes`, `outbox` ya definidas con estructura correcta
- `src/application/products/SaveProductUseCase.ts` — `active: true` hardcodeado a propósito (deferred para esta story); **NO modificar**
- `src/presentation/features/products/screens/ProductFormScreen.tsx` — **modificar** para añadir botón Desactivar
- `src/presentation/store/index.ts` — exporta `useAppStore` con `isAdminMode: boolean` en `posSlice`
- `src/test-utils/db-test-utils.ts` — `createTestDb()` — sin cambios
- `src/test-utils/expoSQLiteMock.ts` — mock del módulo — sin cambios
- `src/infrastructure/repositories/__tests__/ProductRepository.test.ts` — **extender** con tests de deactivate/hasOpenNoteItems

**No existen — CREAR:**
- `src/application/products/DeactivateProductUseCase.ts`
- `src/application/products/__tests__/DeactivateProductUseCase.test.ts`

**No tocar:**
- `src/application/products/SaveProductUseCase.ts` — `active: true` fue diseñado para ser resuelto aquí, pero el UseCase de Save sigue siendo el mismo; la desactivación es exclusiva de `DeactivateProductUseCase`
- `src/presentation/features/products/screens/ProductListScreen.tsx` — no cambia; los productos inactivos ya se filtran en `findAllActive()` con `WHERE active = 1`
- Cualquier archivo de POS (Epic 4b no implementado) — `note_items.product_id` FK se mantiene siempre

### `IProductRepository.ts` — diff completo

```typescript
export interface IProductRepository {
  findAllActive(branchId: string | null): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  deactivate(id: string): Promise<void>;                          // NUEVO
  hasOpenNoteItems(productId: string): Promise<boolean>;          // NUEVO
}
```

### `ProductRepository.deactivate()` — implementación exacta

```typescript
async deactivate(id: string): Promise<void> {
  this.dbInstance
    .update(schema.products)
    .set({ active: 0, version: sql`${schema.products.version} + 1` })
    .where(eq(schema.products.id, id))
    .run();
}
```

**Notas:**
- `sql\`${schema.products.version} + 1\`` — expresión SQL que incrementa la columna atómicamente; `sql` ya está importado
- `active: 0` — SQLite almacena booleanos como INTEGER; 0 = false
- NO incrementar `version` manualmente obteniendo el valor primero — usar la expresión SQL atómica
- El método NO valida si el producto existe (eso es responsabilidad del UseCase)

### `ProductRepository.hasOpenNoteItems()` — implementación exacta

```typescript
async hasOpenNoteItems(productId: string): Promise<boolean> {
  const rows = this.dbInstance
    .select({ id: schema.note_items.id })
    .from(schema.note_items)
    .innerJoin(schema.notes, eq(schema.note_items.note_id, schema.notes.id))
    .where(
      and(
        eq(schema.note_items.product_id, productId),
        eq(schema.notes.status, 'open')
      )
    )
    .limit(1)
    .all();
  return rows.length > 0;
}
```

**Notas:**
- `and` ya está importado en el archivo
- `schema.notes` y `schema.note_items` están definidos en `schema.ts` — ya importado vía `import * as schema`
- `.limit(1)` — eficiencia: solo necesitamos saber si existe al menos uno

### `DeactivateProductUseCase.ts` — implementación completa

```typescript
// src/application/products/DeactivateProductUseCase.ts
import * as Crypto from 'expo-crypto';

import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import { db as defaultDb, type AppDB } from '../../infrastructure/db/client';
import * as schema from '../../infrastructure/db/schema';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';

export class DeactivateProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository = new ProductRepository(),
    private readonly db: AppDB = defaultDb,
  ) {}

  async execute(productId: string): Promise<void> {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new Error('product_not_found');
    if (!product.active) throw new Error('product_already_inactive');

    // SQLite primero
    await this.productRepo.deactivate(productId);

    // Outbox — después de confirmar SQLite
    const now = new Date().toISOString();
    const deactivatedVersion = product.version + 1;
    try {
      this.db
        .insert(schema.outbox)
        .values({
          id: Crypto.randomUUID(),
          entity_type: 'product',
          entity_id: productId,
          operation: 'UPDATE',
          payload: JSON.stringify({ ...product, active: false, version: deactivatedVersion }),
          idempotency_key: `product-deactivate-${productId}`,
          retry_count: 0,
          last_error: null,
          status: 'pending',
          created_at: now,
        })
        .run();
    } catch (err) {
      console.error('[DeactivateProductUseCase] outbox insert failed:', err);
    }
  }
}
```

**CRÍTICO — `idempotency_key`:** Se usa `product-deactivate-${productId}` sin versión porque la desactivación es una operación única y final por producto. Si se reintentara, la clave idempotente garantiza que no se creen dos entradas.

### `ProductFormScreen.tsx` — cambios específicos

**Cambio 1: Nuevo state para el producto cargado + isAdminMode**

```typescript
// AGREGAR imports:
import { useAppStore } from '../../../store';
import { DeactivateProductUseCase } from '../../../../application/products/DeactivateProductUseCase';
import type { Product } from '../../../../domain/entities/Product';

// AGREGAR dentro del componente:
const isAdminMode = useAppStore((s) => s.isAdminMode);
const [product, setProduct] = useState<Product | null>(null);
```

**Cambio 2: Guardar el producto cargado en el useEffect de edición**

```typescript
// En el useEffect que llama findById:
repo.findById(productId).then((p) => {
  if (!mounted || !p) return;
  setProduct(p);                        // AGREGAR esta línea
  setName(p.name);
  setPriceText(String(p.priceCents / 100));
  setCostText(p.costCents != null ? String(p.costCents / 100) : '');
});
```

**Cambio 3: Handler de desactivación**

```typescript
const handleDeactivate = async () => {
  if (!productId) return;
  const hasOpen = await new ProductRepository().hasOpenNoteItems(productId);
  const message = hasOpen
    ? '¿Desactivar este producto? Está siendo usado en notas abiertas. Dejará de aparecer en el POS cuando esas notas se cobren o cancelen.'
    : '¿Desactivar este producto? Dejará de aparecer en el POS.';
  Alert.alert('Desactivar producto', message, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Sí, desactivar',
      style: 'destructive',
      onPress: async () => {
        try {
          await new DeactivateProductUseCase().execute(productId);
          navigation.goBack();
        } catch {
          Alert.alert('Error', 'No se pudo desactivar el producto. Inténtalo de nuevo.');
        }
      },
    },
  ]);
};
```

**Cambio 4: Renderizado del botón "Desactivar"**

Agregar debajo del `<PrimaryButton>` de Guardar, solo cuando aplica:

```tsx
{isAdminMode && productId && product?.active === true && (
  <TouchableOpacity
    style={styles.deactivateButton}
    onPress={handleDeactivate}
    accessibilityRole="button"
    accessibilityLabel="Desactivar producto"
  >
    <Text style={styles.deactivateButtonText}>Desactivar</Text>
  </TouchableOpacity>
)}
```

Y en `StyleSheet`:
```typescript
deactivateButton: {
  alignItems: 'center',
  borderColor: Colors.error,
  borderRadius: Rounded.md,
  borderWidth: 1,
  marginTop: Spacing.md,
  paddingVertical: Spacing.sm,
},
deactivateButtonText: {
  color: Colors.error,
  fontFamily: Typography.fontFamily,
  fontSize: Typography.sizeBase,
  fontWeight: Typography.weightMedium,
},
```

**Agregar `TouchableOpacity` a los imports de `react-native`.**

**CRÍTICO — verificar `Colors.error` en tokens.ts:** Si no existe el token `error`, usar el equivalente rojo definido en `tokens.ts`. Revisar el archivo antes de usarlo.

### Verificar Colors.error en tokens

Antes de implementar, revisar `src/presentation/theme/tokens.ts` para confirmar el nombre exacto del color rojo/destructivo. Posibles nombres: `Colors.error`, `Colors.danger`, `Colors.warning`, `Colors.tagCancelled`. Usar el que esté definido.

### Tests — patrones para `ProductRepository.test.ts`

Los nuevos tests requieren datos relacionados (branches, shifts, notes, note_items). Aquí el setup completo:

```typescript
// Helpers a agregar para los nuevos tests:
const SHIFT_ID = 'shift-1';
const NOTE_ID = 'note-1';
const PROD_ID = 'prod-deactivate';
const NOW = '2026-01-01T00:00:00.000Z';

function insertShift(db: ReturnType<typeof createTestDb>['db']) {
  db.insert(schema.shifts).values({
    id: SHIFT_ID,
    branch_id: BRANCH_ID,
    operator_name: 'Test',
    status: 'open',
    opened_at: NOW,
  }).run();
}

function insertNote(db: ReturnType<typeof createTestDb>['db'], status: 'open' | 'closed' | 'cancelled' = 'open') {
  db.insert(schema.notes).values({
    id: NOTE_ID,
    shift_id: SHIFT_ID,
    customer_alias: 'Cliente',
    status,
    created_at: NOW,
  }).run();
}

function insertNoteItem(db: ReturnType<typeof createTestDb>['db']) {
  db.insert(schema.note_items).values({
    id: 'item-1',
    note_id: NOTE_ID,
    product_id: PROD_ID,
    product_name_snapshot: 'Producto Test',
    unit_price_cents: 5000,
    quantity: 1,
  }).run();
}
```

El `beforeEach` existente limpia `branch_sort`, `products`, `branches`. Añadir limpieza de las nuevas tablas en el correcto orden de FK:

```typescript
beforeEach(() => {
  testDb.delete(schema.note_items).run();  // AGREGAR (hijos primero)
  testDb.delete(schema.notes).run();       // AGREGAR
  testDb.delete(schema.cash_movements).run(); // AGREGAR (prevención)
  testDb.delete(schema.shifts).run();      // AGREGAR
  testDb.delete(schema.branch_sort).run();
  testDb.delete(schema.products).run();
  testDb.delete(schema.branches).run();
});
```

### Tests — patrones para `DeactivateProductUseCase.test.ts`

```typescript
// src/application/products/__tests__/DeactivateProductUseCase.test.ts
import { DeactivateProductUseCase } from '../DeactivateProductUseCase';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { Product } from '../../../domain/entities/Product';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-uuid-deactivate' }));

const activeProduct: Product = {
  id: 'prod-1',
  name: 'Servicio',
  priceCents: 5000,
  costCents: null,
  active: true,
  version: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const inactiveProduct: Product = { ...activeProduct, active: false };

function makeMockRepo(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    findAllActive: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(activeProduct),
    save: jest.fn().mockResolvedValue(undefined),
    deactivate: jest.fn().mockResolvedValue(undefined),
    hasOpenNoteItems: jest.fn().mockResolvedValue(false),
    ...overrides,
  };
}

const mockDb = {
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({ run: jest.fn() }),
  }),
} as any;
```

### Flujo de escritura — recordatorio

Siempre en este orden (per arquitectura):
1. Validar → UseCase
2. Escribir en SQLite → `productRepo.deactivate()`
3. Zustand — **no aplica aquí** (el store de products se refresca en el próximo `useFocusEffect` al regresar al listado)
4. Outbox → después de confirmar SQLite

### Anti-patrones a evitar

```
❌ Validar existencia del producto en ProductRepository.deactivate() — eso es responsabilidad del UseCase
❌ Usar save() con active:false para desactivar — save() tiene active excluido de onConflictDoUpdate por diseño; usar deactivate()
❌ Encolar outbox antes de confirmar SQLite en deactivate
❌ Mostrar el botón "Desactivar" cuando isAdminMode=false
❌ Mostrar el botón "Desactivar" cuando el producto ya está inactivo (product.active === false)
❌ Mostrar el botón "Desactivar" al crear un producto nuevo (productId === undefined)
❌ Llamar hasOpenNoteItems() dentro del UseCase — la verificación es pre-diálogo en la UI; el UseCase desactiva incondicionalmente si el producto existe y está activo
❌ Usar Alert.alert directamente en el UseCase — lógica de presentación fuera de la capa de application
❌ Modificar ProductListScreen — los productos inactivos ya son filtrados por findAllActive() con WHERE active=1
❌ Modificar SaveProductUseCase — active:true sigue hardcodeado; no es scope de esta story
```

### Estructura de archivos resultante

```text
NUEVOS:
  src/application/products/DeactivateProductUseCase.ts
  src/application/products/__tests__/DeactivateProductUseCase.test.ts

MODIFICADOS:
  src/domain/repositories/IProductRepository.ts         (agregar deactivate + hasOpenNoteItems)
  src/infrastructure/repositories/ProductRepository.ts  (implementar deactivate + hasOpenNoteItems)
  src/infrastructure/repositories/__tests__/ProductRepository.test.ts  (agregar tests + ampliar beforeEach)
  src/presentation/features/products/screens/ProductFormScreen.tsx     (botón Desactivar + handler)

SIN CAMBIOS:
  src/application/products/SaveProductUseCase.ts        (active: true sigue hardcodeado — correcto)
  src/domain/entities/Product.ts
  src/infrastructure/db/schema.ts
  src/infrastructure/db/rows/ProductRow.ts
  src/presentation/features/products/screens/ProductListScreen.tsx
  src/presentation/features/products/ProductsNavigator.tsx
  src/presentation/navigation/AdminDrawer.tsx
  src/presentation/navigation/OperatorDrawer.tsx
  src/presentation/store/                               (isAdminMode ya existe en posSlice; NO modificar)
```

### POS store y lista — aclaración importante

El store Zustand tiene `products: ProductRow[]` para uso futuro del POS (Epic 4b). Después de desactivar un producto, este array puede quedar stale hasta el próximo arranque o `useFocusEffect`. **Esto es aceptable para Story 3.3** — Epic 4b no está implementado. No tocar `hydrateStore.ts` ni `posSlice.ts` en esta historia.

La lista de `ProductListScreen` usa `useFocusEffect` + `findAllActive()` directo al repo — al regresar del formulario, la lista se recarga automáticamente y el producto desactivado desaparecerá. Sin cambios necesarios en `ProductListScreen`.

### Definition of Done técnica

- `yarn tsc --noEmit` sin errores (0 errores TypeScript)
- `yarn test` pasa todos los tests — todos los existentes + nuevos (mínimo 9 tests nuevos: 4 en ProductRepository + 3 en DeactivateProductUseCase + integración visual)
- Botón "Desactivar" visible solo en modo Admin con producto activo en edición
- Botón "Desactivar" invisible para Operador y en formulario de alta (sin productId)
- Diálogo de confirmación correcto con texto diferenciado si hay notas abiertas
- Producto desaparece del listado al regresar después de desactivar
- Precio y datos del producto persisten en `product_name_snapshot` de note_items históricas (invariante del schema, sin cambio de código)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.3 ACs]
- [Source: _bmad-output/planning-artifacts/epics.md — FR-12 desactivación solo Admin]
- [Source: _bmad-output/planning-artifacts/architecture.md — §Patrones de Métodos de Repositorio (deactivate)]
- [Source: _bmad-output/planning-artifacts/architecture.md — §Flujo de Escritura de Datos (SQLite → Outbox)]
- [Source: _bmad-output/planning-artifacts/architecture.md — §Anti-Patrones Prohibidos]
- [Source: _bmad-output/planning-artifacts/architecture.md — §Acciones Zustand separación estricta]
- [Source: _bmad-output/implementation-artifacts/3-2-crear-y-editar-productos.md — Dev Notes, patrones save/test establecidos]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md — active:true hardcodeado en SaveProductUseCase deferred a Story 3.3]
- [Source: src/application/products/SaveProductUseCase.ts — patrón outbox a replicar]
- [Source: src/infrastructure/repositories/ProductRepository.ts — estado actual (findAllActive/findById/save)]
- [Source: src/infrastructure/repositories/__tests__/ProductRepository.test.ts — patrón de tests a extender]
- [Source: src/presentation/features/products/screens/ProductFormScreen.tsx — estado actual a modificar]
- [Source: src/presentation/store/slices/posSlice.ts — isAdminMode: boolean en PosSlice]
- [Source: src/presentation/store/index.ts — useAppStore export]

## Dev Agent Record

### Debug Log

- Consulté Context7 para Expo `expo-crypto` y Drizzle ORM antes de modificar código.
- Agregué `deactivate()` y `hasOpenNoteItems()` al contrato y a la implementación del repositorio de productos.
- Creé `DeactivateProductUseCase` con validación de existencia/estado y encolado de outbox posterior a SQLite.
- Actualicé `ProductFormScreen` para mostrar el botón "Desactivar" solo en modo admin y con producto activo.
- Extendí la cobertura con pruebas de repositorio, use case y pantalla.
- Ejecuté validación completa: `yarn type-check`, `yarn lint`, `yarn test --runInBand`.

### Completion Notes

- Se implementó la desactivación lógica de productos para administradores sin afectar el historial de notas.
- El formulario de producto ahora muestra confirmación distinta cuando el producto está referenciado por notas abiertas.
- La desactivación actualiza SQLite primero y luego encola el outbox con `operation: 'UPDATE'`.
- La cobertura nueva valida desactivación, detección de notas abiertas, errores del use case y el flujo visual del formulario.
- La suite completa quedó verde; Jest sigue reportando una advertencia de open handles al final, pero no rompe la ejecución.

## File List

- `_bmad-output/implementation-artifacts/3-3-desactivar-productos-solo-administrador.md`
- `src/application/products/DeactivateProductUseCase.ts`
- `src/application/products/__tests__/DeactivateProductUseCase.test.ts`
- `src/application/products/__tests__/SaveProductUseCase.test.ts`
- `src/domain/repositories/IProductRepository.ts`
- `src/infrastructure/repositories/ProductRepository.ts`
- `src/infrastructure/repositories/__tests__/ProductRepository.test.ts`
- `src/presentation/features/products/screens/ProductFormScreen.tsx`
- `src/presentation/features/products/screens/__tests__/ProductFormScreen.test.tsx`

### Review Findings

- [x] [Review][Patch] Double-tap race condition en botón "Desactivar" — sin flag in-flight, dos taps rápidos abren dos Alert dialogs y ejecutan dos DeactivateProductUseCase.execute() en paralelo; el segundo falla con `product_already_inactive` mostrando error genérico al usuario [src/presentation/features/products/screens/ProductFormScreen.tsx:handleDeactivate] ✓ fixed
- [x] [Review][Patch] Sin try/catch alrededor de `hasOpenNoteItems` en `handleDeactivate` — si SQLite lanza, la promesa rechazada no es capturada y no hay feedback al usuario [src/presentation/features/products/screens/ProductFormScreen.tsx:76] ✓ fixed
- [x] [Review][Patch] Sin test que verifique que presionar "Cancelar" en el diálogo aborta la desactivación (AC-PROD3-03 gap) [src/presentation/features/products/screens/__tests__/ProductFormScreen.test.tsx] ✓ fixed
- [x] [Review][Defer] TOCTOU — `hasOpenNoteItems` puede estar stale cuando el usuario confirma; el mensaje informativo podría ser incorrecto (inherente al check-then-act en mobile local-first) [src/presentation/features/products/screens/ProductFormScreen.tsx:76-87] — deferred, pre-existing
- [x] [Review][Defer] Version skew teórico entre incremento atómico en DB y `product.version + 1` en payload outbox (spec-prescribed pattern, irrelevante en app mobile single-user) [src/application/products/DeactivateProductUseCase.ts:26-31] — deferred, pre-existing
- [x] [Review][Defer] Outbox try/catch silencia errores de insert — si falla, el producto queda desactivado en SQLite sin evento de sync encolado (spec-prescribed, mismo patrón que SaveProductUseCase) [src/application/products/DeactivateProductUseCase.ts:48-51] — deferred, pre-existing
- [x] [Review][Defer] `new ProductRepository()` y `new DeactivateProductUseCase()` instanciados directamente en la pantalla (pre-existing pattern en todo el codebase) [src/presentation/features/products/screens/ProductFormScreen.tsx:76,88] — deferred, pre-existing
- [x] [Review][Defer] `product.active` en JSX puede estar stale si sync externo desactiva el producto mientras la pantalla está abierta (limitación inherente al modelo local-first) [src/presentation/features/products/screens/ProductFormScreen.tsx:180] — deferred, pre-existing
- [x] [Review][Defer] `deactivate()` silently no-ops en ID inexistente — el use case valida existencia antes de llamarlo; sin riesgo en app single-user [src/infrastructure/repositories/ProductRepository.ts:87] — deferred, pre-existing
- [x] [Review][Defer] `.run()` síncrono con wrapper async en `deactivate()` (mismo patrón pre-existente de `save()` y `BranchRepository`, Drizzle sync API para SQLite) [src/infrastructure/repositories/ProductRepository.ts:87] — deferred, pre-existing

## Change Log

- 2026-06-09: Implementé el flujo de desactivación de productos para administradores, incluyendo repositorio, use case, UI y pruebas asociadas.
