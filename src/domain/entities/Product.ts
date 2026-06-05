export interface Product {
  id: string;
  name: string;
  priceCents: number;
  costCents: number | null;
  active: boolean;
  version: number;
  createdAt: string;
}
