import type { Product } from '../entities/Product';

export interface IProductRepository {
  findAllActive(branchId: string | null): Promise<Product[]>;
}
