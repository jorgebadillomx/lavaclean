export interface CashMovementRow {
  id: string;
  shift_id: string;
  type: 'income' | 'expense';
  description: string;
  amount_cents: number;
  created_at: string;
}
