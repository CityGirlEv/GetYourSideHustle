SELECT guide_id, json_extract(patch_json,'$.assignee') AS assignee,
  json_extract(patch_json,'$.steps') AS steps,
  json_extract(patch_json,'$.tools') AS tools,
  json_extract(patch_json,'$.supplies') AS supplies,
  json_extract(patch_json,'$.suggestedPricing') AS pricing,
  json_extract(patch_json,'$.prerequisites') AS prereqs
FROM guide_catalog_state
WHERE guide_id IN (
  'notary',
  'resume-linkedin-helper',
  'short-form-video-editor',
  'google-business-helper'
);

SELECT case_id, assignee FROM test_case_status
WHERE case_id GLOB 'GUIDE-REV-*-notary'
   OR case_id GLOB 'GUIDE-REV-*-resume-linkedin-helper'
   OR case_id GLOB 'GUIDE-REV-*-short-form-video-editor'
   OR case_id GLOB 'GUIDE-REV-*-google-business-helper';
