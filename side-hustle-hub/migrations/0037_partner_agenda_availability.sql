-- Per-partner availability mode (preferred times vs flexible) + excluded dates

CREATE TABLE IF NOT EXISTS partner_agenda_availability (
  agenda_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'preferred' CHECK (mode IN ('preferred', 'flexible')),
  excluded_dates TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (agenda_id, user_id),
  FOREIGN KEY (agenda_id) REFERENCES partner_agenda(id) ON DELETE CASCADE
);
