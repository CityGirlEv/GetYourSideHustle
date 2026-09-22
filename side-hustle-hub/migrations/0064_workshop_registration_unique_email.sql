-- One registered seat per email per workshop.
CREATE UNIQUE INDEX IF NOT EXISTS idx_workshop_registrations_workshop_email
  ON workshop_registrations (workshop_id, email)
  WHERE status = 'registered';
