-- Daily digest idempotency + task assignment change log (for reassigned-away highlights).

CREATE TABLE IF NOT EXISTS digest_sends (
  id TEXT PRIMARY KEY,
  chicago_date TEXT NOT NULL,
  to_email TEXT NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL,
  provider_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (chicago_date, to_email)
);

CREATE INDEX IF NOT EXISTS idx_digest_sends_date ON digest_sends(chicago_date DESC);

CREATE TABLE IF NOT EXISTS assignment_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'test')),
  entity_id TEXT NOT NULL,
  from_assignee TEXT NOT NULL DEFAULT '',
  to_assignee TEXT NOT NULL DEFAULT '',
  changed_by TEXT NOT NULL DEFAULT '',
  changed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assignment_events_at ON assignment_events(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignment_events_entity ON assignment_events(entity_type, entity_id, changed_at DESC);
