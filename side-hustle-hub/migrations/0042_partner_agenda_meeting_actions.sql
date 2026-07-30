-- Meeting-level notes + action items (assigned in agenda, pushed to backlog as tasks)

ALTER TABLE partner_agenda ADD COLUMN meeting_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE partner_agenda ADD COLUMN meeting_action_items_json TEXT NOT NULL DEFAULT '[]';
