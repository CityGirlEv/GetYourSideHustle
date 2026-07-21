-- Daily Progress Report export / send audit log with regeneratable HTML snapshot
CREATE TABLE IF NOT EXISTS daily_progress_reports (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  created_by_email TEXT NOT NULL DEFAULT '',
  created_by_name TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL,
  period_from TEXT NOT NULL,
  period_to TEXT NOT NULL,
  period_label TEXT NOT NULL DEFAULT '',
  users_filter TEXT NOT NULL DEFAULT 'All users',
  snapshot_json TEXT NOT NULL DEFAULT '{}',
  snapshot_html TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_daily_progress_reports_created
  ON daily_progress_reports(created_at DESC);
