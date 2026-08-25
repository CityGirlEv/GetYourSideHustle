-- Chunked attachment payloads (D1 max ~2MB per string; files up to 3MB).
CREATE TABLE IF NOT EXISTS attachment_content_chunks (
  attachment_id TEXT NOT NULL,
  part_index INTEGER NOT NULL,
  content_base64 TEXT NOT NULL,
  PRIMARY KEY (attachment_id, part_index)
);

CREATE INDEX IF NOT EXISTS idx_attachment_content_chunks_id
  ON attachment_content_chunks (attachment_id);
