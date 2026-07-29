-- Parent coach settings, kid login events, and progress-report cadence.
-- Apply: npm run db:migrate:local   (or npm run db:migrate for remote)

CREATE TABLE IF NOT EXISTS parent_family_settings (
  parent_user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  progress_report_cadence TEXT NOT NULL DEFAULT 'none'
    CHECK (progress_report_cadence IN ('none', 'daily', 'weekly')),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS child_login_events (
  id TEXT PRIMARY KEY,
  child_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE SET NULL,
  child_display_name TEXT NOT NULL DEFAULT '',
  logged_in_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_child_login_events_parent
  ON child_login_events(parent_user_id, logged_in_at DESC);

CREATE TABLE IF NOT EXISTS parent_progress_report_sends (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cadence TEXT NOT NULL CHECK (cadence IN ('daily', 'weekly')),
  period_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TEXT NOT NULL,
  UNIQUE (parent_user_id, cadence, period_key)
);
