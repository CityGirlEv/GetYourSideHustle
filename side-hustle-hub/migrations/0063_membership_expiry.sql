-- Membership expiration / next renewal, last recorded charge, and reminder de-dupe.
ALTER TABLE users ADD COLUMN membership_expires_at TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN membership_last_paid_at TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN membership_renewal_reminded_for TEXT NOT NULL DEFAULT '';
