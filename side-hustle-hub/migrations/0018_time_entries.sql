-- Partner work timers (tasks + tests) for timesheets
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_label TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  accumulated_ms INTEGER NOT NULL DEFAULT 0,
  running_since TEXT,
  work_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_status ON time_entries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_source ON time_entries(source, source_id);
