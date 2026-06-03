import { StateCreator } from 'zustand';

export interface AdminSlice {
  selectedBranch: string | null;
  setSelectedBranch: (branchId: string | null) => void;
}

export const createAdminSlice: StateCreator<AdminSlice, [], [], AdminSlice> = (set) => ({
  selectedBranch: null,
  setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),
});
