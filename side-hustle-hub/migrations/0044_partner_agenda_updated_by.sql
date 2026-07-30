-- Track who last updated the partner agenda (shown on PDF footer)

ALTER TABLE partner_agenda ADD COLUMN updated_by_name TEXT NOT NULL DEFAULT '';
