-- Manual ordering for agenda preview drag-and-drop

ALTER TABLE partner_agenda_items ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_partner_agenda_items_sort
  ON partner_agenda_items(agenda_id, category, sort_order, created_at);
