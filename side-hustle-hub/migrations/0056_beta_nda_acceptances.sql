-- Beta Tester NDA acceptances — versioned proof of which agreement each tester signed.
CREATE TABLE IF NOT EXISTS beta_nda_acceptances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nda_version TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  email TEXT NOT NULL,
  signature TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_beta_nda_user_version
  ON beta_nda_acceptances(user_id, nda_version);

CREATE INDEX IF NOT EXISTS idx_beta_nda_user
  ON beta_nda_acceptances(user_id);
