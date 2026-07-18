-- Per-partner completion for plan items assigned to Both.
-- A Both plan item is Done only when both partners have marked their own done.

ALTER TABLE plan_items ADD COLUMN done_tina INTEGER NOT NULL DEFAULT 0;
ALTER TABLE plan_items ADD COLUMN done_evelyn INTEGER NOT NULL DEFAULT 0;

UPDATE plan_items SET done_tina = 1, done_evelyn = 1
WHERE status = 'done' AND owner = 'Both';

UPDATE plan_items SET done_tina = 1
WHERE status = 'done' AND owner = 'Tina';

UPDATE plan_items SET done_evelyn = 1
WHERE status = 'done' AND owner = 'Evelyn';
