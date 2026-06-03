export interface ShiftRow {
  id: string;
  branch_id: string;
  operator_name: string;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
  initial_bills_cents: number;
  initial_coins_cents: number;
  final_bills_cents: number | null;
  final_coins_cents: number | null;
}
