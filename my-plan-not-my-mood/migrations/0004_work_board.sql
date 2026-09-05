CREATE TABLE IF NOT EXISTS work_board_store (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
