-- Admin Active / Inactive flags for launch guides (library visibility).
-- Missing row = Active (published). Inactive guides are hidden from non-admins.

CREATE TABLE IF NOT EXISTS guide_catalog_state (
  guide_id TEXT PRIMARY KEY,
  published INTEGER NOT NULL DEFAULT 1,
  deleted INTEGER NOT NULL DEFAULT 0,
  custom INTEGER NOT NULL DEFAULT 0,
  patch_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);
