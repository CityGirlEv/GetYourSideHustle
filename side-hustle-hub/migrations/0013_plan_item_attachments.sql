-- Attachment metadata for implementation plan / sprint items.
-- File blobs are still browser-local IndexedDB until R2 upload is wired.

CREATE TABLE IF NOT EXISTS plan_item_attachments (
  id TEXT PRIMARY KEY,
  plan_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  stored_id TEXT NOT NULL,
  r2_key TEXT,
  added_at TEXT NOT NULL,
  FOREIGN KEY(plan_item_id) REFERENCES plan_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plan_item_attachments_item
  ON plan_item_attachments(plan_item_id);
