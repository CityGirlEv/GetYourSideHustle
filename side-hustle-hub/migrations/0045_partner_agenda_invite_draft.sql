-- Persist editable admin agenda email subject + message

ALTER TABLE partner_agenda ADD COLUMN invite_subject TEXT NOT NULL DEFAULT '';
ALTER TABLE partner_agenda ADD COLUMN invite_body TEXT NOT NULL DEFAULT '';
