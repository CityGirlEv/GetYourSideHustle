-- Shared task/test attachments for the work board (bytes in D1).
CREATE TABLE IF NOT EXISTS work_attachments (
  id TEXT PRIMARY KEY,
  item_kind TEXT NOT NULL,
  item_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_by_email TEXT NOT NULL DEFAULT '',
  uploaded_at TEXT NOT NULL,
  content_base64 TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_work_attachments_item ON work_attachments(item_kind, item_id);
