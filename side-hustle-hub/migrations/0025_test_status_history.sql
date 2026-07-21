-- Append-only history so tester updates can be recovered if a row is ever wiped.
CREATE TABLE IF NOT EXISTS test_case_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  assignee TEXT NOT NULL DEFAULT '',
  sprint INTEGER NOT NULL DEFAULT 0,
  due_date TEXT NOT NULL DEFAULT '',
  checked_steps_json TEXT NOT NULL DEFAULT '[]',
  failed_step_index INTEGER,
  changed_at TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT 'upsert'
);

CREATE INDEX IF NOT EXISTS idx_test_case_status_history_case
  ON test_case_status_history(case_id, changed_at DESC);
