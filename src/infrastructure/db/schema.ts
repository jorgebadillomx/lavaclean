import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const branches = sqliteTable('branches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  footer_message: text('footer_message'),
  created_at: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price_cents: integer('price_cents').notNull(),
  cost_cents: integer('cost_cents'),
  active: integer('active').notNull().default(1),
  version: integer('version').notNull().default(1),
  created_at: text('created_at').notNull(),
});

export const branch_sort = sqliteTable(
  'branch_sort',
  {
    branch_id: text('branch_id')
      .notNull()
      .references(() => branches.id),
    product_id: text('product_id')
      .notNull()
      .references(() => products.id),
    sort_order: integer('sort_order').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.branch_id, table.product_id] }),
  }),
);

export const shifts = sqliteTable('shifts', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id')
    .notNull()
    .references(() => branches.id),
  operator_name: text('operator_name').notNull(),
  status: text('status').$type<'open' | 'closed'>().notNull(),
  opened_at: text('opened_at').notNull(),
  closed_at: text('closed_at'),
  initial_bills_cents: integer('initial_bills_cents').notNull().default(0),
  initial_coins_cents: integer('initial_coins_cents').notNull().default(0),
  final_bills_cents: integer('final_bills_cents'),
  final_coins_cents: integer('final_coins_cents'),
});

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  shift_id: text('shift_id')
    .notNull()
    .references(() => shifts.id),
  customer_alias: text('customer_alias').notNull(),
  status: text('status').$type<'open' | 'closed' | 'cancelled'>().notNull(),
  cancelled_reason: text('cancelled_reason'),
  created_at: text('created_at').notNull(),
  closed_at: text('closed_at'),
  payment_method: text('payment_method').$type<'cash' | 'card' | 'transfer' | null>(),
  amount_received_cents: integer('amount_received_cents'),
  change_cents: integer('change_cents'),
  ticket_payload: text('ticket_payload'),
});

export const note_items = sqliteTable('note_items', {
  id: text('id').primaryKey(),
  note_id: text('note_id')
    .notNull()
    .references(() => notes.id),
  product_id: text('product_id')
    .notNull()
    .references(() => products.id),
  product_name_snapshot: text('product_name_snapshot').notNull(),
  unit_price_cents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull().default(1),
});

export const cash_movements = sqliteTable('cash_movements', {
  id: text('id').primaryKey(),
  shift_id: text('shift_id')
    .notNull()
    .references(() => shifts.id),
  type: text('type').$type<'income' | 'expense'>().notNull(),
  description: text('description').notNull(),
  amount_cents: integer('amount_cents').notNull(),
  created_at: text('created_at').notNull(),
});

export const outbox = sqliteTable('outbox', {
  id: text('id').primaryKey(),
  entity_type: text('entity_type').notNull(),
  entity_id: text('entity_id').notNull(),
  operation: text('operation').$type<'INSERT' | 'UPDATE' | 'DELETE'>().notNull(),
  payload: text('payload').notNull(),
  idempotency_key: text('idempotency_key').notNull().unique(),
  retry_count: integer('retry_count').notNull().default(0),
  last_error: text('last_error'),
  status: text('status')
    .$type<'pending' | 'synced' | 'failed' | 'dead_letter'>()
    .notNull()
    .default('pending'),
  created_at: text('created_at').notNull(),
});

export const _meta = sqliteTable('_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
