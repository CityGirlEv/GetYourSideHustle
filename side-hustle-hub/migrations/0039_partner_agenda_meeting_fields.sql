-- Meeting header + discussion structure for partner agenda

ALTER TABLE partner_agenda ADD COLUMN meeting_date TEXT NOT NULL DEFAULT '';
ALTER TABLE partner_agenda ADD COLUMN meeting_time TEXT NOT NULL DEFAULT '';
ALTER TABLE partner_agenda ADD COLUMN invited_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE partner_agenda ADD COLUMN attended_json TEXT NOT NULL DEFAULT '[]';

ALTER TABLE partner_agenda_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
ALTER TABLE partner_agenda_items ADD COLUMN importance INTEGER NOT NULL DEFAULT 3;
ALTER TABLE partner_agenda_items ADD COLUMN discussion_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE partner_agenda_items ADD COLUMN action_items_json TEXT NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_partner_agenda_items_importance
  ON partner_agenda_items(agenda_id, importance, created_at);
