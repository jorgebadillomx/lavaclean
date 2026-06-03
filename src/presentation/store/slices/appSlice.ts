import { StateCreator } from 'zustand';
import { InitState } from '../../types/async';

export interface AppSlice {
  initializationStatus: InitState;
  initializationError: string | null;
  setInitializationStatus: (status: InitState) => void;
  setInitializationError: (error: string | null) => void;
  resetInitialization: () => void;
}

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (set) => ({
  initializationStatus: 'UNINITIALIZED',
  initializationError: null,
  setInitializationStatus: (status) => set({ initializationStatus: status }),
  setInitializationError: (error) => set({ initializationError: error }),
  resetInitialization: () => set({ initializationStatus: 'UNINITIALIZED', initializationError: null }),
});
