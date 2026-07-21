-- Persist task / plan attachment file bytes in D1 (base64).
-- Previously only metadata was stored; blobs lived in browser IndexedDB only.

ALTER TABLE task_attachments ADD COLUMN content_base64 TEXT;
ALTER TABLE plan_item_attachments ADD COLUMN content_base64 TEXT;
