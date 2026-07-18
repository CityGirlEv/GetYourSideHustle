-- QA notes on test cases (required when status = fail)

ALTER TABLE test_case_status ADD COLUMN note TEXT NOT NULL DEFAULT '';
