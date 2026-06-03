import { EMPTY_STATE_REGISTRY } from '../emptyStateRegistry';

describe('emptyStateRegistry', () => {
  it('has exactly 5 variants', () => {
    expect(Object.keys(EMPTY_STATE_REGISTRY)).toHaveLength(5);
  });

  it('matches the exact copy for OPEN_NOTES', () => {
    expect(EMPTY_STATE_REGISTRY.OPEN_NOTES.text).toBe(
      'No hay notas abiertas. Crea la primera.'
    );
  });

  it('matches the exact copy for CLOSED_NOTES', () => {
    expect(EMPTY_STATE_REGISTRY.CLOSED_NOTES.text).toBe(
      'No hay ventas en este turno aún.'
    );
  });

  it('matches the exact copy for CASH_MOVEMENTS', () => {
    expect(EMPTY_STATE_REGISTRY.CASH_MOVEMENTS.text).toBe(
      'No hay movimientos registrados.'
    );
  });

  it('matches the exact copy for PRODUCTS', () => {
    expect(EMPTY_STATE_REGISTRY.PRODUCTS.text).toBe(
      'Agrega tus servicios para empezar.'
    );
  });

  it('matches the exact copy for TABLET_POS', () => {
    expect(EMPTY_STATE_REGISTRY.TABLET_POS.text).toBe(
      'Selecciona una nota para ver el detalle.'
    );
  });
});
