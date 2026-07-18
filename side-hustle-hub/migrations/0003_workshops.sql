-- Workshops & guest speakers (editable via admin; public read)

CREATE TABLE IF NOT EXISTS guest_speakers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  topics_json TEXT NOT NULL DEFAULT '[]',
  accent TEXT NOT NULL DEFAULT '#9B2F28',
  initials TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workshops (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT 'TBD',
  time TEXT NOT NULL DEFAULT 'TBD',
  format TEXT NOT NULL DEFAULT 'Live Zoom',
  audience TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'upcoming',
  speaker_ids_json TEXT NOT NULL DEFAULT '[]',
  tags_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
