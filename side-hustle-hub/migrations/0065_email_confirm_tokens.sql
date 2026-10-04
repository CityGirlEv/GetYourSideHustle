-- One-time membership verification tokens (hashed). Raw token is emailed only.
CREATE TABLE IF NOT EXISTS email_confirm_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_confirm_token_hash ON email_confirm_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_confirm_user ON email_confirm_tokens(user_id);
