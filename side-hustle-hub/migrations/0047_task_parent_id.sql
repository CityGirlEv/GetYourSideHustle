-- Parent / subtask linking (e.g. T-041 → T-041T, T-041E).
-- Empty string = root task (no parent).

ALTER TABLE tasks ADD COLUMN parent_id TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
