-- Side Hustle Blueprint persistence + family/child profiles for Match Wizard unlock.
-- Apply: npm run db:migrate:local   (or npm run db:migrate for remote)

-- ---------------------------------------------------------------------------
-- Free / paid member metadata on users (roles already support kid|junior|adult|admin|qa)
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN membership_tier TEXT NOT NULL DEFAULT 'free';
-- free | basic | pro | elite (app enforces values)

ALTER TABLE users ADD COLUMN audience TEXT NOT NULL DEFAULT 'adult';
-- adult | senior | junior | parent (parent owns kids profiles; kid role stays on child rows)

ALTER TABLE users ADD COLUMN parent_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
-- Set when this user row is a child/junior profile owned by a parent account

CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_users_audience ON users(audience);

-- ---------------------------------------------------------------------------
-- Family / parent accounts (Kids 4–12 must not own independent logins)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_accounts (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS child_profiles (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES family_accounts(id) ON DELETE CASCADE,
  parent_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  age_band TEXT NOT NULL CHECK (age_band IN ('kids', 'junior')),
  -- Never store child email for kids (4–12). Junior email optional.
  contact_email TEXT,
  linked_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_family ON child_profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON child_profiles(parent_user_id);

-- ---------------------------------------------------------------------------
-- Saved Side Hustle Blueprint results (recalculated server-side on save when possible)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS side_hustle_blueprints (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Optional: attach Kids Blueprint to a child profile (parent owns user_id)
  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'junior', 'adult', 'senior')),
  answers_json TEXT NOT NULL DEFAULT '{}',
  result_ids_json TEXT NOT NULL DEFAULT '[]',
  -- Display-only scores; treat as untrusted — recalculate on read/save in API
  result_pcts_json TEXT NOT NULL DEFAULT '{}',
  top_result_id TEXT,
  unlocked INTEGER NOT NULL DEFAULT 1 CHECK (unlocked IN (0, 1)),
  source TEXT NOT NULL DEFAULT 'wizard',
  -- Client pending handoff id (never put PII in URLs; this is an opaque claim token)
  claim_token TEXT UNIQUE,
  completed_at TEXT NOT NULL,
  unlocked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blueprints_user ON side_hustle_blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_child ON side_hustle_blueprints(child_profile_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_age ON side_hustle_blueprints(age_group);
CREATE INDEX IF NOT EXISTS idx_blueprints_claim ON side_hustle_blueprints(claim_token);

-- Favorites / save actions from the full Blueprint page
CREATE TABLE IF NOT EXISTS blueprint_favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blueprint_id TEXT NOT NULL REFERENCES side_hustle_blueprints(id) ON DELETE CASCADE,
  hustle_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, blueprint_id, hustle_id)
);

-- ---------------------------------------------------------------------------
-- Pending Blueprint claims (logged-out → register/login handoff)
-- Opaque token only — answers/results live here until linked to a user
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pending_blueprints (
  claim_token TEXT PRIMARY KEY,
  age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'junior', 'adult', 'senior')),
  answers_json TEXT NOT NULL DEFAULT '{}',
  result_ids_json TEXT NOT NULL DEFAULT '[]',
  result_pcts_json TEXT NOT NULL DEFAULT '{}',
  return_view TEXT NOT NULL DEFAULT 'quiz',
  return_tab TEXT,
  expires_at TEXT NOT NULL,
  claimed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_blueprints_expires ON pending_blueprints(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_blueprints_claimed ON pending_blueprints(claimed_by_user_id);

-- ---------------------------------------------------------------------------
-- Kids team signup: child_email optional (Kids 4–12 must not require child email)
-- SQLite cannot DROP NOT NULL easily; add companion nullable column for new writes.
-- App should prefer child_email_optional; keep child_email for juniors/legacy rows.
-- ---------------------------------------------------------------------------
ALTER TABLE junior_signups ADD COLUMN child_email_optional TEXT;
ALTER TABLE junior_signups ADD COLUMN child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE SET NULL;
ALTER TABLE junior_signups ADD COLUMN blueprint_claim_token TEXT;

CREATE INDEX IF NOT EXISTS idx_junior_signups_blueprint ON junior_signups(blueprint_claim_token);
