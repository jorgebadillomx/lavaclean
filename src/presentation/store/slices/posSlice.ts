import { StateCreator } from 'zustand';
import type { ShiftRow } from '../../../infrastructure/db/rows/ShiftRow';
import type { ProductRow } from '../../../infrastructure/db/rows/ProductRow';

export interface PosSlice {
  activeShift: ShiftRow | null;
  activeBranch: string | null;
  products: ProductRow[];
  pendingOperatorName: string | null;
  setActiveShift: (shift: ShiftRow | null) => void;
  setActiveBranch: (branchId: string | null) => void;
  setProducts: (products: ProductRow[]) => void;
  setPendingOperatorName: (name: string | null) => void;
  resetPOSState: () => void;
}

export const createPosSlice: StateCreator<PosSlice, [], [], PosSlice> = (set) => ({
  activeShift: null,
  activeBranch: null,
  products: [],
  pendingOperatorName: null,
  setActiveShift: (shift) => set({ activeShift: shift }),
  setActiveBranch: (branchId) => set({ activeBranch: branchId }),
  setProducts: (products) => set({ products }),
  setPendingOperatorName: (name) => set({ pendingOperatorName: name }),
  resetPOSState: () => set({ activeShift: null, activeBranch: null, products: [], pendingOperatorName: null }),
});
