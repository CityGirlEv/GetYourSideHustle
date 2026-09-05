CREATE TABLE IF NOT EXISTS gear_selections (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  style TEXT NOT NULL,
  family_id TEXT NOT NULL,
  family_label TEXT NOT NULL,
  name TEXT NOT NULL,
  relative_path TEXT NOT NULL DEFAULT '',
  data_url TEXT NOT NULL DEFAULT '',
  uploaded_at TEXT NOT NULL DEFAULT '',
  uploaded_by TEXT NOT NULL DEFAULT 'Evelyn'
);

CREATE TABLE IF NOT EXISTS gear_selections_meta (
  id TEXT PRIMARY KEY,
  picks TEXT NOT NULL DEFAULT '[]',
  source_folder_path TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
