-- GYSH Admin Financials: budget, expenses, receipts, partnership contract docs

CREATE TABLE IF NOT EXISTS financial_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('budget', 'expense')),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_financial_items_type ON financial_items(type);
CREATE INDEX IF NOT EXISTS idx_financial_items_date ON financial_items(date);

CREATE TABLE IF NOT EXISTS financial_files (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES financial_items(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('receipt', 'contract')),
  title TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  stored_id TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  added_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_financial_files_item ON financial_files(item_id);
CREATE INDEX IF NOT EXISTS idx_financial_files_scope ON financial_files(scope);
