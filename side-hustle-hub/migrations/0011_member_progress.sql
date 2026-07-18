-- Member progress (checklist ticks, launch-guide steps) — per logged-in user
CREATE TABLE IF NOT EXISTS member_progress (
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_member_progress_user ON member_progress(user_id);
