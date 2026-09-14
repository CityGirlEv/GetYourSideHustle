-- #028 AI-for-Peers Coffee Chat: strip kit overlays (and stale minTier); assign Evelyn.
-- Removing $.minTier unfreezes Elite from code. Do not write a new minTier. Do not change published / Guide Status.
UPDATE guide_catalog_state
SET patch_json = json_set(
      json_remove(
        CASE WHEN patch_json IS NULL OR trim(patch_json) = '' THEN '{}' ELSE patch_json END,
        '$.steps',
        '$.tools',
        '$.supplies',
        '$.suggestedPricing',
        '$.prerequisites',
        '$.minTier'
      ),
      '$.assignee',
      json_quote('evelyn')
    ),
    updated_at = '2026-09-14T00:45:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id = 'ai-peers';

UPDATE test_case_status
SET assignee = 'evelyn',
    updated_at = '2026-09-14T00:45:00.000Z',
    updated_by = 'Evelyn Irving',
    assigned_by = CASE WHEN assigned_by IS NULL OR trim(assigned_by) = '' THEN 'Evelyn Irving' ELSE assigned_by END,
    date_assigned = CASE WHEN date_assigned IS NULL OR trim(date_assigned) = '' THEN date('now') ELSE date_assigned END
WHERE case_id GLOB 'GUIDE-REV-*-ai-peers';
