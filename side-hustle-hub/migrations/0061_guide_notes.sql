-- Per-guide member notes + attachments (shared thread; author can edit own; admin any).

CREATE TABLE IF NOT EXISTS guide_notes (
  id TEXT PRIMARY KEY,
  guide_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guide_notes_guide
  ON guide_notes (guide_id, created_at);

CREATE TABLE IF NOT EXISTS guide_note_attachments (
  id TEXT PRIMARY KEY,
  guide_id TEXT NOT NULL,
  note_id TEXT,
  uploaded_by_user_id TEXT NOT NULL,
  uploaded_by_name TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  content_base64 TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guide_note_attachments_guide
  ON guide_note_attachments (guide_id, created_at);

CREATE INDEX IF NOT EXISTS idx_guide_note_attachments_note
  ON guide_note_attachments (note_id);
