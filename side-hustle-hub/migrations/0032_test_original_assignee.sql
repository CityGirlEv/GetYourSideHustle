-- Remember the QA tester who owned a case before Fail auto-routed it to the Lead Developer (Evelyn).
-- Idempotent via runtime ensureTestCaseStatusColumns; apply once via wrangler migrations.
-- SQLite has no IF NOT EXISTS for ADD COLUMN — if column already exists from runtime ensure,
-- mark this migration applied manually (see d1_migrations) rather than re-running ALTER.
ALTER TABLE test_case_status ADD COLUMN original_assignee TEXT NOT NULL DEFAULT '';
