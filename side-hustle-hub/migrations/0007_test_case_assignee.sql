-- Per-test assignee override (QA Testing Portal). Empty = use code default.

ALTER TABLE test_case_status ADD COLUMN assignee TEXT NOT NULL DEFAULT '';
