-- Editable branded-email content for Admin → Email templates
ALTER TABLE email_templates ADD COLUMN preheader TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN eyebrow TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN headline TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN subhead TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN body_html TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN cta_label TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN cta_url TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN footer_note TEXT NOT NULL DEFAULT '';
ALTER TABLE email_templates ADD COLUMN content_seeded INTEGER NOT NULL DEFAULT 0;
