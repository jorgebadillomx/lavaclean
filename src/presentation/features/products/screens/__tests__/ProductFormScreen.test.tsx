import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppStore } from '../../../../store';
import { ProductFormScreen } from '../ProductFormScreen';
import type { ProductsStackParamList } from '../../ProductsNavigator';

type ProductFormNavigation = NativeStackNavigationProp<ProductsStackParamList, 'ProductForm'>;

const mockSetOptions = jest.fn();
const mockGoBack = jest.fn();
let mockNavigation: ProductFormNavigation;
let mockRoute: never;

let mockFindById: jest.Mock;
let mockHasOpenNoteItems: jest.Mock;
let mockSaveExecute: jest.Mock;
let mockDeactivateExecute: jest.Mock;

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => mockNavigation,
    useRoute: () => mockRoute,
  };
});

jest.mock('../../../../../infrastructure/repositories/ProductRepository', () => {
  mockFindById = jest.fn();
  mockHasOpenNoteItems = jest.fn();
  return {
    ProductRepository: jest.fn().mockImplementation(() => ({
      findById: mockFindById,
      hasOpenNoteItems: mockHasOpenNoteItems,
    })),
  };
});

jest.mock('../../../../../application/products/SaveProductUseCase', () => {
  mockSaveExecute = jest.fn().mockResolvedValue({
    id: 'prod-1',
    name: 'Servicio',
    priceCents: 5000,
    costCents: null,
    active: true,
    version: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  });
  return {
    SaveProductUseCase: jest.fn().mockImplementation(() => ({
      execute: mockSaveExecute,
    })),
  };
});

jest.mock('../../../../../application/products/DeactivateProductUseCase', () => {
  mockDeactivateExecute = jest.fn().mockResolvedValue(undefined);
  return {
    DeactivateProductUseCase: jest.fn().mockImplementation(() => ({
      execute: mockDeactivateExecute,
    })),
  };
});

describe('ProductFormScreen', () => {
  const activeProduct = {
    id: 'prod-1',
    name: 'Servicio',
    priceCents: 5000,
    costCents: null,
    active: true,
    version: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    mockSetOptions.mockReset();
    mockGoBack.mockReset();
    mockNavigation = {
      setOptions: mockSetOptions,
      goBack: mockGoBack,
    } as unknown as ProductFormNavigation;
    mockRoute = {
      params: { productId: 'prod-1' },
    } as never;
    mockFindById.mockReset();
    mockHasOpenNoteItems.mockReset();
    mockSaveExecute.mockReset();
    mockDeactivateExecute.mockReset();
    mockFindById.mockResolvedValue(activeProduct);
    mockHasOpenNoteItems.mockResolvedValue(false);
    useAppStore.setState({
      activeShift: null,
      activeBranch: null,
      products: [],
      pendingOperatorName: null,
      isAdminMode: true,
    } as never);
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('muestra el botón Desactivar solo para admin con producto activo cargado', async () => {
    render(<ProductFormScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Desactivar producto')).toBeTruthy();
    });
  });

  it('oculta el botón Desactivar cuando el usuario no es admin', async () => {
    useAppStore.setState({ isAdminMode: false } as never);

    render(<ProductFormScreen />);

    await waitFor(() => {
      expect(screen.queryByLabelText('Desactivar producto')).toBeNull();
    });
  });

  it('oculta el botón Desactivar cuando el producto cargado ya está inactivo', async () => {
    mockFindById.mockResolvedValueOnce({ ...activeProduct, active: false });

    render(<ProductFormScreen />);

    await waitFor(() => {
      expect(screen.queryByLabelText('Desactivar producto')).toBeNull();
    });
  });

  it('presionar "Cancelar" en el diálogo no ejecuta la desactivación', async () => {
    render(<ProductFormScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Desactivar producto')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Desactivar producto'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Desactivar producto',
        expect.any(String),
        expect.any(Array),
      );
    });

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    act(() => { buttons[0].onPress?.(); });

    expect(mockDeactivateExecute).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('muestra advertencia por notas abiertas y ejecuta la desactivación al confirmar', async () => {
    mockHasOpenNoteItems.mockResolvedValueOnce(true);

    render(<ProductFormScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Desactivar producto')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Desactivar producto'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Desactivar producto',
        '¿Desactivar este producto? Está siendo usado en notas abiertas. Dejará de aparecer en el POS cuando esas notas se cobren o cancelen.',
        expect.any(Array),
      );
    });

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    await buttons[1].onPress();

    await waitFor(() => {
      expect(mockHasOpenNoteItems).toHaveBeenCalledWith('prod-1');
      expect(mockDeactivateExecute).toHaveBeenCalledWith('prod-1');
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
