-- Closed / locked sprints — after End Sprint, no further item modifications
CREATE TABLE IF NOT EXISTS closed_sprints (
  sprint_index INTEGER PRIMARY KEY,
  closed_at TEXT NOT NULL,
  closed_by TEXT NOT NULL DEFAULT ''
);
