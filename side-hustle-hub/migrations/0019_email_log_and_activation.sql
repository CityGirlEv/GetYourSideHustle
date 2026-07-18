-- Email log + templates + user activation tracking
CREATE TABLE IF NOT EXISTS email_templates (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY,
  template_slug TEXT NOT NULL,
  to_email TEXT NOT NULL,
  user_id TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_id TEXT,
  error TEXT NOT NULL DEFAULT '',
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_template ON email_log(template_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_to ON email_log(to_email);

-- Activation / deactivation audit columns on users
ALTER TABLE users ADD COLUMN activated_at TEXT;
ALTER TABLE users ADD COLUMN activated_by TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN deactivated_at TEXT;
ALTER TABLE users ADD COLUMN deactivated_by TEXT NOT NULL DEFAULT '';

-- Child profiles: parent can deactivate
ALTER TABLE child_profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE child_profiles ADD COLUMN deactivated_at TEXT;
ALTER TABLE child_profiles ADD COLUMN deactivated_by TEXT NOT NULL DEFAULT '';
