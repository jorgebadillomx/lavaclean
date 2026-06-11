import type { Product } from '../entities/Product';

export interface IProductRepository {
  findAllActive(branchId: string | null): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  deactivate(id: string): Promise<void>;
  hasOpenNoteItems(productId: string): Promise<boolean>;
  saveBranchSort(branchId: string, entries: { productId: string; sortOrder: number }[]): Promise<void>;
}
