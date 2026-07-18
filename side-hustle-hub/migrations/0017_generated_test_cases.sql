-- Failure-generated Vitest/Playwright cases (created when a suite run fails)
CREATE TABLE IF NOT EXISTS generated_test_cases (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P1',
  suite TEXT NOT NULL DEFAULT 'vitest',
  steps_json TEXT NOT NULL DEFAULT '[]',
  expected TEXT NOT NULL DEFAULT '',
  failure_detail TEXT NOT NULL DEFAULT '',
  fix_steps_json TEXT NOT NULL DEFAULT '[]',
  severity TEXT NOT NULL DEFAULT 'P1',
  source_file TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  created_from_run TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_generated_test_cases_suite ON generated_test_cases(suite);
