-- Hide deleted dummy/test payments from Financials → Payments (Stripe sessions stay in Stripe).
-- member_name on gysh_payments is added at runtime in ensurePaymentsTable if missing.

CREATE TABLE IF NOT EXISTS gysh_payment_exclusions (
  session_id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT 'admin_deleted',
  deleted_by TEXT NOT NULL DEFAULT '',
  deleted_at TEXT NOT NULL
);
