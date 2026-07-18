-- Junior/Kids team signups with parental consent tracking.
-- A child registers with their email + parent's email. The parent receives a
-- consent link, registers, and grants permission before the account activates.

CREATE TABLE IF NOT EXISTS junior_signups (
  id TEXT PRIMARY KEY,
  team TEXT NOT NULL DEFAULT 'junior',          -- 'kids' | 'junior'
  child_name TEXT NOT NULL,
  child_email TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_parent', -- pending_parent | active | declined
  consent_token TEXT NOT NULL UNIQUE,
  parent_name TEXT NOT NULL DEFAULT '',
  parent_phone TEXT NOT NULL DEFAULT '',
  parent_address TEXT NOT NULL DEFAULT '',
  parent_relationship TEXT NOT NULL DEFAULT '',
  consent_granted_at TEXT,
  declined_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_junior_signups_token ON junior_signups(consent_token);
CREATE INDEX IF NOT EXISTS idx_junior_signups_status ON junior_signups(status);
