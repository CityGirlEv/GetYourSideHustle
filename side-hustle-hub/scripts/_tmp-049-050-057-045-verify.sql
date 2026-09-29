SELECT guide_id,
       json_extract(patch_json, '$.assignee') AS assignee,
       json_extract(patch_json, '$.minTier') AS min_tier,
       json_extract(patch_json, '$.steps') IS NOT NULL AS has_steps,
       json_extract(patch_json, '$.tools') IS NOT NULL AS has_tools,
       json_extract(patch_json, '$.supplies') IS NOT NULL AS has_supplies,
       json_extract(patch_json, '$.suggestedPricing') IS NOT NULL AS has_pricing,
       json_extract(patch_json, '$.prerequisites') IS NOT NULL AS has_prereqs
FROM guide_catalog_state
WHERE guide_id IN (
  'community-newsletter-creator',
  'teaching',
  'review-response-assistant',
  'consulting'
);

SELECT case_id, assignee
FROM test_case_status
WHERE case_id GLOB 'GUIDE-REV-*-community-newsletter-creator'
   OR case_id GLOB 'GUIDE-REV-*-teaching'
   OR case_id GLOB 'GUIDE-REV-*-review-response-assistant'
   OR case_id GLOB 'GUIDE-REV-*-consulting';
