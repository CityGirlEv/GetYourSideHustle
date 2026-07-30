-- Finalize agenda to drop DRAFT watermark on printed/PDF agenda

ALTER TABLE partner_agenda ADD COLUMN finalized_at TEXT;
