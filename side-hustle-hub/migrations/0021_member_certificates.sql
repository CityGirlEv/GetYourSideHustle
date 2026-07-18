-- Editable welcome certificate template + per-member generated certificates
CREATE TABLE IF NOT EXISTS certificate_template (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  body TEXT NOT NULL,
  signoff TEXT NOT NULL,
  footer_line TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS member_certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_email TEXT NOT NULL,
  membership_tier TEXT NOT NULL DEFAULT 'free',
  audience TEXT NOT NULL DEFAULT 'adult',
  issued_at TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  body_text TEXT NOT NULL,
  signoff TEXT NOT NULL,
  svg_markup TEXT NOT NULL,
  pdf_base64 TEXT NOT NULL DEFAULT '',
  email_sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_member_certificates_user ON member_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_member_certificates_issued ON member_certificates(issued_at DESC);

INSERT OR IGNORE INTO certificate_template (
  id, title, subtitle, body, signoff, footer_line, updated_at, updated_by
) VALUES (
  'welcome_family',
  'Welcome to the GYSH Family',
  'Certificate of Membership',
  'This certifies that {{name}} is a valued member of the Get Your Side Hustle family, welcomed on {{date}} as a {{tier}} member in the {{audience}} lane.',
  'T + E · Get Your Side Hustle',
  'Four wizards. One family adventure. · getyoursidehustle.com',
  datetime('now'),
  'system'
);
