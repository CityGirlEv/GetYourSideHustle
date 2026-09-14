SELECT guide_id,
       json_extract(patch_json, '$.assignee') AS assignee,
       json_extract(patch_json, '$.steps') IS NOT NULL AS has_steps,
       json_extract(patch_json, '$.tools') IS NOT NULL AS has_tools,
       json_extract(patch_json, '$.supplies') IS NOT NULL AS has_supplies,
       json_extract(patch_json, '$.suggestedPricing') IS NOT NULL AS has_pricing,
       json_extract(patch_json, '$.prerequisites') IS NOT NULL AS has_prereqs
FROM guide_catalog_state
WHERE guide_id = 'book-publishing-kids';
