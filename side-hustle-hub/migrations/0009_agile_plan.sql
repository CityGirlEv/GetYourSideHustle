-- Agile implementation plan: backlog/sprint items + retrospective board

CREATE TABLE IF NOT EXISTS plan_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT 'Both',
  kind TEXT NOT NULL DEFAULT 'rollout',
  sprint INTEGER NOT NULL DEFAULT -1,
  status TEXT NOT NULL DEFAULT 'todo',
  date TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plan_items_sprint ON plan_items(sprint);
CREATE INDEX IF NOT EXISTS idx_plan_items_status ON plan_items(status);

CREATE TABLE IF NOT EXISTS retro_cards (
  id TEXT PRIMARY KEY,
  sprint INTEGER NOT NULL,
  column_key TEXT NOT NULL CHECK (column_key IN ('went_well', 'improve', 'action')),
  text TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT 'Both',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_retro_cards_sprint ON retro_cards(sprint);
