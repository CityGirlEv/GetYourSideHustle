-- Per-partner completion for tasks assigned to Both.
-- Task is Done only when both partners have marked their own done.

ALTER TABLE tasks ADD COLUMN done_tina INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN done_evelyn INTEGER NOT NULL DEFAULT 0;

UPDATE tasks SET done_tina = 1, done_evelyn = 1
WHERE status = 'done' AND assigned_to = 'Both';

UPDATE tasks SET done_tina = 1
WHERE status = 'done' AND assigned_to = 'Tina';

UPDATE tasks SET done_evelyn = 1
WHERE status = 'done' AND assigned_to = 'Evelyn';
