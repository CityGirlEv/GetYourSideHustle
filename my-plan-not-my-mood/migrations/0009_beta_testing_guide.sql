CREATE TABLE IF NOT EXISTS beta_testing_guide_store (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
