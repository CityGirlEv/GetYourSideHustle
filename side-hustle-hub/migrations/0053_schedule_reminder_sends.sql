-- Idempotency for Schedule Suite reminder emails (daily / weekly / biweekly / monthly).
CREATE TABLE IF NOT EXISTS schedule_reminder_sends (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  schedule_id TEXT NOT NULL,
  cadence TEXT NOT NULL,
  period_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TEXT NOT NULL,
  UNIQUE(user_id, schedule_id, cadence, period_key)
);

CREATE INDEX IF NOT EXISTS idx_schedule_reminder_sends_user
  ON schedule_reminder_sends(user_id, created_at);
