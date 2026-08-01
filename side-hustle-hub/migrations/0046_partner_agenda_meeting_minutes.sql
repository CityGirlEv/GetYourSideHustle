-- Total partner meeting length used for timed agenda slots / PDF / live timer.
ALTER TABLE partner_agenda ADD COLUMN meeting_minutes INTEGER NOT NULL DEFAULT 60;
