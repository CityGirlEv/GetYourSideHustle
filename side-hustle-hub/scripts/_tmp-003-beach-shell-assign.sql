-- #003: show code kit. Assign Evelyn. Do not change published/minTier (Unique Unique Free).
UPDATE guide_catalog_state
SET patch_json = json_set(
      json_remove(
        CASE WHEN patch_json IS NULL OR trim(patch_json) = '' THEN '{}' ELSE patch_json END,
        '$.steps',
        '$.tools',
        '$.supplies',
        '$.prerequisites',
        '$.suggestedPricing'
      ),
      '$.assignee',
      json_quote('evelyn'),
      '$.name',
      json_quote('Beach Shell Jewelry')
    ),
    updated_at = '2026-09-13T10:40:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id = 'beach-shell-jewelry';

UPDATE test_case_status
SET assignee = 'evelyn',
    updated_at = '2026-09-13T10:40:00.000Z',
    updated_by = 'Evelyn Irving',
    assigned_by = CASE WHEN assigned_by IS NULL OR trim(assigned_by) = '' THEN 'Evelyn Irving' ELSE assigned_by END,
    date_assigned = CASE WHEN date_assigned IS NULL OR trim(date_assigned) = '' THEN date('now') ELSE date_assigned END
WHERE case_id GLOB 'GUIDE-REV-*-beach-shell-jewelry';
