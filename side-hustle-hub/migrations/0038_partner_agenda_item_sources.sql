-- Linked Task List / Testing Portal sources on agenda items

ALTER TABLE partner_agenda_items ADD COLUMN source_kind TEXT NOT NULL DEFAULT 'user';
ALTER TABLE partner_agenda_items ADD COLUMN source_id TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_partner_agenda_items_source
  ON partner_agenda_items(agenda_id, source_kind, source_id);
