import { create } from 'zustand';
import { createAppSlice, AppSlice } from './slices/appSlice';
import { createPosSlice, PosSlice } from './slices/posSlice';
import { createAdminSlice, AdminSlice } from './slices/adminSlice';

export type AppStore = AppSlice & PosSlice & AdminSlice;

export const useAppStore = create<AppStore>()((...a) => ({
  ...createAppSlice(...a),
  ...createPosSlice(...a),
  ...createAdminSlice(...a),
}));
