-- GYSH Stripe / membership payments ledger (Financials → Payments)

CREATE TABLE IF NOT EXISTS gysh_payments (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  payment_intent_id TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  user_id TEXT,
  kind TEXT NOT NULL DEFAULT 'membership',
  tier TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT '',
  interval TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  paid_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'stripe',
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gysh_payments_paid_at ON gysh_payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_gysh_payments_kind ON gysh_payments(kind);
CREATE INDEX IF NOT EXISTS idx_gysh_payments_email ON gysh_payments(email);
