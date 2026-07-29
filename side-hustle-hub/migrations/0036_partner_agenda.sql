-- Interactive partner meeting agenda + preferred meeting time picks

CREATE TABLE IF NOT EXISTS partner_agenda (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Partner Meeting Agenda',
  active INTEGER NOT NULL DEFAULT 1,
  created_by_user_id TEXT NOT NULL DEFAULT '',
  created_by_name TEXT NOT NULL DEFAULT '',
  invite_sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partner_agenda_items (
  id TEXT PRIMARY KEY,
  agenda_id TEXT NOT NULL,
  body TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agenda_id) REFERENCES partner_agenda(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_partner_agenda_items_agenda ON partner_agenda_items(agenda_id);
CREATE INDEX IF NOT EXISTS idx_partner_agenda_items_author ON partner_agenda_items(author_user_id);

CREATE TABLE IF NOT EXISTS partner_agenda_time_picks (
  id TEXT PRIMARY KEY,
  agenda_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  starts_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (agenda_id) REFERENCES partner_agenda(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_partner_agenda_picks_agenda ON partner_agenda_time_picks(agenda_id);
CREATE INDEX IF NOT EXISTS idx_partner_agenda_picks_user ON partner_agenda_time_picks(user_id);
