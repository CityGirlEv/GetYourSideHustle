-- #035, #095, #093: show code kits. Assign Evelyn. Do not change published/minTier.
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
      json_quote('Basic Invitation Creator')
    ),
    updated_at = '2026-09-13T11:40:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id = 'basic-invitation-creator';

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
      json_quote('Print-on-Demand (POD)')
    ),
    updated_at = '2026-09-13T11:40:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id = 'pod';

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
      json_quote('Pet Sitting & Dog Walking')
    ),
    updated_at = '2026-09-13T11:40:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id = 'pet-sitting';

UPDATE test_case_status
SET assignee = 'evelyn',
    updated_at = '2026-09-13T11:40:00.000Z',
    updated_by = 'Evelyn Irving',
    assigned_by = CASE WHEN assigned_by IS NULL OR trim(assigned_by) = '' THEN 'Evelyn Irving' ELSE assigned_by END,
    date_assigned = CASE WHEN date_assigned IS NULL OR trim(date_assigned) = '' THEN date('now') ELSE date_assigned END
WHERE case_id GLOB 'GUIDE-REV-*-basic-invitation-creator'
   OR case_id GLOB 'GUIDE-REV-*-pod'
   OR case_id GLOB 'GUIDE-REV-*-pet-sitting';
