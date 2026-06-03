export interface ProductRow {
  id: string;
  name: string;
  price_cents: number;
  cost_cents: number | null;
  active: number;
  version: number;
  created_at: string;
}
