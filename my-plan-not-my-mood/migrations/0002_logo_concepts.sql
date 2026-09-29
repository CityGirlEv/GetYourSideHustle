CREATE TABLE IF NOT EXISTS logo_concepts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'logo',
  notes TEXT NOT NULL DEFAULT '',
  relative_path TEXT NOT NULL DEFAULT '',
  data_url TEXT NOT NULL DEFAULT '',
  uploaded_at TEXT NOT NULL DEFAULT '',
  uploaded_by TEXT NOT NULL DEFAULT 'Evelyn'
);

CREATE TABLE IF NOT EXISTS logo_concepts_meta (
  id TEXT PRIMARY KEY,
  chosen_id TEXT,
  source_folder_path TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
