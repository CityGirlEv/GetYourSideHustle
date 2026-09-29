CREATE TABLE IF NOT EXISTS email_send_log (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL DEFAULT '',
  template_name TEXT NOT NULL DEFAULT '',
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  html TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  is_test INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON email_send_log(created_at);
CREATE INDEX IF NOT EXISTS idx_email_send_log_template ON email_send_log(template_id);
