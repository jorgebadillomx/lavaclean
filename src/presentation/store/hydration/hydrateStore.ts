import { eq } from 'drizzle-orm';
import { db as defaultDb, AppDB } from '../../../infrastructure/db/client';
import * as schema from '../../../infrastructure/db/schema';
import type { ShiftRow } from '../../../infrastructure/db/rows/ShiftRow';
import type { ProductRow } from '../../../infrastructure/db/rows/ProductRow';
import { useAppStore } from '../index';

export type HydrationResult = {
  status: 'success' | 'error';
  completedAt: string | null;
  error?: string;
};

export function hydrateStore(dbInstance: AppDB = defaultDb): HydrationResult {
  const currentStatus = useAppStore.getState().initializationStatus;

  // G5: Idempotencia — si ya está READY, no re-hidratar
  if (currentStatus === 'READY') {
    return { status: 'success', completedAt: new Date().toISOString() };
  }

  // P2: Guard re-entrant — previene regresión de estado si se llama desde LOADING_DB o HYDRATING_STORE
  if (currentStatus === 'LOADING_DB' || currentStatus === 'HYDRATING_STORE') {
    return { status: 'error', completedAt: null, error: 'Hydration already in progress' };
  }

  // P3: Limpiar estado POS estale antes de cada intento (garantía "sin estado parcial" en retry)
  useAppStore.getState().resetPOSState();

  useAppStore.getState().setInitializationStatus('LOADING_DB');

  // G4: Verificación de accesibilidad — si la DB está corrupta o inaccesible, fallará aquí.
  try {
    dbInstance.select().from(schema._meta).limit(1).all();
  } catch (err) {
    useAppStore.getState().setInitializationStatus('ERROR');
    useAppStore.getState().setInitializationError(`DB no accesible: ${String(err)}`);
    return { status: 'error', completedAt: null, error: String(err) };
  }

  // HYDRATING_STORE: transición sin posibilidad de regresar a LOADING_DB (AC INIT_STATE_003)
  useAppStore.getState().setInitializationStatus('HYDRATING_STORE');

  try {
    // 1. appConfig: sucursal activa
    const branchRow = dbInstance.select().from(schema._meta)
      .where(eq(schema._meta.key, 'active_branch_id'))
      .all()[0];
    const activeBranch = branchRow?.value ?? null;

    // 2. products: catálogo activo (G2: null activo = DB vacía, no default hardcodeado)
    const products = dbInstance.select().from(schema.products)
      .where(eq(schema.products.active, 1))
      .all() as ProductRow[];

    // 3. active_session: turno abierto en la sucursal activa
    let activeShift: ShiftRow | null = null;
    if (activeBranch) {
      const openShifts = dbInstance.select().from(schema.shifts)
        .where(eq(schema.shifts.status, 'open'))
        .all() as ShiftRow[];
      activeShift = openShifts.find(s => s.branch_id === activeBranch) ?? null;
    }

    // Actualizar store — G2: todos los valores vienen de SQLite
    useAppStore.getState().setActiveBranch(activeBranch);
    useAppStore.getState().setActiveShift(activeShift);
    useAppStore.getState().setProducts(products);

    useAppStore.getState().setInitializationStatus('READY');
    return { status: 'success', completedAt: new Date().toISOString() };

  } catch (err) {
    // AC INIT_STATE_003: fallo en HYDRATING_STORE → ERROR (nunca volver a LOADING_DB)
    useAppStore.getState().setInitializationStatus('ERROR');
    useAppStore.getState().setInitializationError(`Hydration falló: ${String(err)}`);
    return { status: 'error', completedAt: null, error: String(err) };
  }
}
