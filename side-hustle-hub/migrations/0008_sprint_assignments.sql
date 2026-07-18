-- Stable sprint assignments for operational tasks and QA test cases.
-- Sprint 0 is anchored to Jul 14–20, 2026.

ALTER TABLE tasks ADD COLUMN sprint INTEGER NOT NULL DEFAULT 0;
ALTER TABLE test_case_status ADD COLUMN sprint INTEGER NOT NULL DEFAULT 0;
