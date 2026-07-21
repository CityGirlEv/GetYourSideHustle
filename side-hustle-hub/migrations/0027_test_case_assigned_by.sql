-- Assigned By / Assigned Date for Testing Portal (catalog defaults = System).
-- Idempotent via runtime ensureTestCaseStatusColumns; apply once via wrangler migrations.
ALTER TABLE test_case_status ADD COLUMN assigned_by TEXT NOT NULL DEFAULT 'System';
ALTER TABLE test_case_status ADD COLUMN date_assigned TEXT NOT NULL DEFAULT '';
