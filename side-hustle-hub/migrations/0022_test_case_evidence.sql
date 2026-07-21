-- Step checklists, failed-step index, and fail evidence attachments for Testing Portal.

ALTER TABLE test_case_status ADD COLUMN checked_steps_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE test_case_status ADD COLUMN failed_step_index INTEGER;

CREATE TABLE IF NOT EXISTS test_case_attachments (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  content_base64 TEXT NOT NULL,
  scan_status TEXT NOT NULL DEFAULT 'clean',
  scan_detail TEXT NOT NULL DEFAULT '',
  added_at TEXT NOT NULL,
  added_by TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_test_case_attachments_case ON test_case_attachments(case_id);
