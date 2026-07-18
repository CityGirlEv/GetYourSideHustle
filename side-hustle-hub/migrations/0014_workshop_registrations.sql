-- Workshop registration settings and public registration records.

ALTER TABLE workshops ADD COLUMN registration_open INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workshops ADD COLUMN capacity INTEGER NOT NULL DEFAULT 25;
ALTER TABLE workshops ADD COLUMN registration_note TEXT NOT NULL DEFAULT 'Registration is not open yet. Check back after the schedule is confirmed.';

CREATE TABLE IF NOT EXISTS workshop_registrations (
  id TEXT PRIMARY KEY,
  workshop_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  attendee_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TEXT NOT NULL,
  FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
);
