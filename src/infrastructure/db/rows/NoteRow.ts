export interface NoteRow {
  id: string;
  shift_id: string;
  customer_alias: string;
  status: 'open' | 'closed' | 'cancelled';
  cancelled_reason: string | null;
  created_at: string;
  closed_at: string | null;
  payment_method: 'cash' | 'card' | 'transfer' | null;
  amount_received_cents: number | null;
  change_cents: number | null;
  ticket_payload: string | null;
}
