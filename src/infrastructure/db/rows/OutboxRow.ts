export interface OutboxRow {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: string;
  idempotency_key: string;
  retry_count: number;
  last_error: string | null;
  status: 'pending' | 'synced' | 'failed' | 'dead_letter';
  created_at: string;
}
