-- Audit trail: who last updated each task (tests already have updated_by)
ALTER TABLE tasks ADD COLUMN updated_by TEXT NOT NULL DEFAULT '';
