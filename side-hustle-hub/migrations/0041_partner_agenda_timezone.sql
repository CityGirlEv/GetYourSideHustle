-- Meeting schedule timezone for partner agenda header

ALTER TABLE partner_agenda ADD COLUMN meeting_timezone TEXT NOT NULL DEFAULT 'America/Chicago';
