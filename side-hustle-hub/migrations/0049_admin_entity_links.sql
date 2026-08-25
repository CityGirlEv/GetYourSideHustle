-- Manual + suppressed navigational links between tasks, tests, and Content Factory items.
-- suppressed=0 → additive user link; suppressed=1 → hide this pair (including catalog edges).

CREATE TABLE IF NOT EXISTS admin_entity_links (
  id TEXT PRIMARY KEY,
  a_kind TEXT NOT NULL CHECK (a_kind IN ('task', 'test', 'cf')),
  a_id TEXT NOT NULL,
  b_kind TEXT NOT NULL CHECK (b_kind IN ('task', 'test', 'cf')),
  b_id TEXT NOT NULL,
  suppressed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT '',
  UNIQUE (a_kind, a_id, b_kind, b_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_entity_links_a ON admin_entity_links (a_kind, a_id);
CREATE INDEX IF NOT EXISTS idx_admin_entity_links_b ON admin_entity_links (b_kind, b_id);
