-- COMPLETE kits: strip kit overlays; assign Evelyn. Do NOT change published / minTier / Guide Status.
-- 023 ai-assets, 026 ai-social-helper, 030 airbnb-cohost, 033 amazon, 036 birthday-party-helper,
-- 041 virtual-call-assistant, 048 closet-organizer, 051 junior-content-create, 052 lien-tax-sales,
-- 053 kids-craft-hustle, 054 create-games-kids, 055 create-games-junior, 056 custom-bookmark-creator,
-- 085 web-leads, 086 mailbox-cleaning

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
    updated_at = '2026-09-14T10:30:00.000Z',
    updated_by = 'Evelyn Irving'
WHERE guide_id IN (
  'ai-assets',
  'ai-social-helper',
  'airbnb-cohost',
  'amazon',
  'birthday-party-helper',
  'virtual-call-assistant',
  'closet-organizer',
  'junior-content-create',
  'lien-tax-sales',
  'kids-craft-hustle',
  'create-games-kids',
  'create-games-junior',
  'custom-bookmark-creator',
  'web-leads',
  'mailbox-cleaning'
);

UPDATE test_case_status
SET assignee = 'evelyn',
    updated_at = '2026-09-14T10:30:00.000Z',
    updated_by = 'Evelyn Irving',
    assigned_by = CASE WHEN assigned_by IS NULL OR trim(assigned_by) = '' THEN 'Evelyn Irving' ELSE assigned_by END,
    date_assigned = CASE WHEN date_assigned IS NULL OR trim(date_assigned) = '' THEN date('now') ELSE date_assigned END
WHERE case_id GLOB 'GUIDE-REV-*-ai-assets'
   OR case_id GLOB 'GUIDE-REV-*-ai-social-helper'
   OR case_id GLOB 'GUIDE-REV-*-airbnb-cohost'
   OR case_id GLOB 'GUIDE-REV-*-amazon'
   OR case_id GLOB 'GUIDE-REV-*-birthday-party-helper'
   OR case_id GLOB 'GUIDE-REV-*-virtual-call-assistant'
   OR case_id GLOB 'GUIDE-REV-*-closet-organizer'
   OR case_id GLOB 'GUIDE-REV-*-junior-content-create'
   OR case_id GLOB 'GUIDE-REV-*-lien-tax-sales'
   OR case_id GLOB 'GUIDE-REV-*-kids-craft-hustle'
   OR case_id GLOB 'GUIDE-REV-*-create-games-kids'
   OR case_id GLOB 'GUIDE-REV-*-create-games-junior'
   OR case_id GLOB 'GUIDE-REV-*-custom-bookmark-creator'
   OR case_id GLOB 'GUIDE-REV-*-web-leads'
   OR case_id GLOB 'GUIDE-REV-*-mailbox-cleaning';
