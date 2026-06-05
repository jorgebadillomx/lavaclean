import { useAppStore } from '../../index';

describe('posSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeShift: null,
      activeBranch: null,
      products: [],
      pendingOperatorName: null,
      isAdminMode: false,
    } as never);
  });

  describe('resetPOSState', () => {
    it('resetea isAdminMode a false', () => {
      useAppStore.getState().setIsAdminMode(true);
      expect(useAppStore.getState().isAdminMode).toBe(true);

      useAppStore.getState().resetPOSState();

      expect(useAppStore.getState().isAdminMode).toBe(false);
    });

    it('resetea todos los campos POS a sus valores iniciales', () => {
      useAppStore.setState({
        activeShift: { id: 'shift-1', operator_name: 'Juan', branch_id: 'b-1', status: 'open' },
        activeBranch: 'branch-1',
        pendingOperatorName: 'Juan',
        isAdminMode: true,
      } as never);

      useAppStore.getState().resetPOSState();

      const { activeShift, activeBranch, pendingOperatorName, isAdminMode } = useAppStore.getState();
      expect(activeShift).toBeNull();
      expect(activeBranch).toBeNull();
      expect(pendingOperatorName).toBeNull();
      expect(isAdminMode).toBe(false);
    });
  });

  describe('setIsAdminMode', () => {
    it('establece isAdminMode a true', () => {
      useAppStore.getState().setIsAdminMode(true);
      expect(useAppStore.getState().isAdminMode).toBe(true);
    });

    it('establece isAdminMode a false', () => {
      useAppStore.setState({ isAdminMode: true } as never);
      useAppStore.getState().setIsAdminMode(false);
      expect(useAppStore.getState().isAdminMode).toBe(false);
    });
  });
});
