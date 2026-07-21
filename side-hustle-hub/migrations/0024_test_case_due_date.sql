-- Per-case due date for Testing Portal (MM/DD/YY or empty), aligned to sprint Sundays by default.
-- Idempotent: column may already exist from runtime ensureTestCaseStatusColumns.
-- SQLite has no IF NOT EXISTS for ADD COLUMN; apply via wrangler only once (tracked in d1_migrations).
ALTER TABLE test_case_status ADD COLUMN due_date TEXT NOT NULL DEFAULT '';
