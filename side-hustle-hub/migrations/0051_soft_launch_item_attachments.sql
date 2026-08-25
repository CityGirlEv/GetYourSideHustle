-- Image (and creative) attachments for Content Factory / soft-launch calendar items.

CREATE TABLE IF NOT EXISTS soft_launch_item_attachments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  content_base64 TEXT NOT NULL DEFAULT '',
  added_at TEXT NOT NULL,
  added_by TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_soft_launch_item_attachments_item
  ON soft_launch_item_attachments (item_id);
