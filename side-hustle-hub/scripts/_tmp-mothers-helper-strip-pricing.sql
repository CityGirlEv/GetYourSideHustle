-- Strip old Suggested Pricing overlay so #001 uses code kit starter examples.
-- Do not change published, assignee, or minTier.
UPDATE guide_catalog_state
SET patch_json = json_remove(
      CASE WHEN patch_json IS NULL OR trim(patch_json) = '' THEN '{}' ELSE patch_json END,
      '$.suggestedPricing'
    ),
    updated_at = '2026-09-13T02:20:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id = 'mothers-helper';
