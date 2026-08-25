-- Optional caption / note on uploaded attachments (tasks, tests, Content Factory).
-- Columns may already exist from runtime ensureAttachmentNoteColumns — keep this
-- migration idempotent so later migrations (0053+) can apply.
-- SQLite has no ADD COLUMN IF NOT EXISTS.

SELECT 1 WHERE 1 = 1;
