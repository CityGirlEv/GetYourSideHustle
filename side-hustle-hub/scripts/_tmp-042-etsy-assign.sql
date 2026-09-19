-- #042 Etsy Store: strip kit overlays so the Prerequisites callout is not duplicated by D1; assign Evelyn.
-- Do not change published / minTier / Guide Status.
UPDATE guide_catalog_state
SET patch_json = json_set(
      json_remove(
        CASE WHEN patch_json IS NULL OR trim(patch_json) = '' THEN '{}' ELSE patch_json END,
        '$.steps',
        '$.tools',
        '$.supplies',
        '$.suggestedPricing',
        '$.prerequisites'
      ),
      '$.assignee',
      json_quote('evelyn')
    ),
    updated_at = '2026-09-14T07:40:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id = 'etsy-store';

UPDATE test_case_status
SET assignee = 'evelyn',
    updated_at = '2026-09-14T07:40:00.000Z',
    updated_by = 'Evelyn Irving',
    assigned_by = CASE WHEN assigned_by IS NULL OR trim(assigned_by) = '' THEN 'Evelyn Irving' ELSE assigned_by END,
    date_assigned = CASE WHEN date_assigned IS NULL OR trim(date_assigned) = '' THEN date('now') ELSE date_assigned END
WHERE case_id GLOB 'GUIDE-REV-*-etsy-store';
