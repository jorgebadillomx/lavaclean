export type EmptyStateVariant =
  | 'OPEN_NOTES'
  | 'CLOSED_NOTES'
  | 'CASH_MOVEMENTS'
  | 'PRODUCTS'
  | 'TABLET_POS';

type EmptyStateConfig = {
  text: string;
  actionLabel?: string;
};

export const EMPTY_STATE_REGISTRY: Record<EmptyStateVariant, EmptyStateConfig> = {
  OPEN_NOTES: {
    text: 'No hay notas abiertas. Crea la primera.',
    actionLabel: 'Nueva nota',
  },
  CLOSED_NOTES: {
    text: 'No hay ventas en este turno aún.',
  },
  CASH_MOVEMENTS: {
    text: 'No hay movimientos registrados.',
    actionLabel: 'Registrar movimiento',
  },
  PRODUCTS: {
    text: 'Agrega tus servicios para empezar.',
  },
  TABLET_POS: {
    text: 'Selecciona una nota para ver el detalle.',
  },
};
