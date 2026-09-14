-- #091 / #100 / #102 / #072 COMPLETE kits: strip kit overlays; assign Evelyn.
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
    updated_at = '2026-09-14T04:05:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id IN (
  'notary',
  'resume-linkedin-helper',
  'short-form-video-editor',
  'google-business-helper'
);

UPDATE test_case_status
SET assignee = 'evelyn',
    updated_at = '2026-09-14T04:05:00.000Z',
    updated_by = 'Evelyn Irving',
    assigned_by = CASE WHEN assigned_by IS NULL OR trim(assigned_by) = '' THEN 'Evelyn Irving' ELSE assigned_by END,
    date_assigned = CASE WHEN date_assigned IS NULL OR trim(date_assigned) = '' THEN date('now') ELSE date_assigned END
WHERE case_id GLOB 'GUIDE-REV-*-notary'
   OR case_id GLOB 'GUIDE-REV-*-resume-linkedin-helper'
   OR case_id GLOB 'GUIDE-REV-*-short-form-video-editor'
   OR case_id GLOB 'GUIDE-REV-*-google-business-helper';
