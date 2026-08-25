-- Editable overrides for Content Factory / soft-launch calendar items.
-- Catalog in code remains the default; patch_json stores partial SoftLaunchItem fields.

CREATE TABLE IF NOT EXISTS soft_launch_item_overrides (
  item_id TEXT PRIMARY KEY,
  patch_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);
