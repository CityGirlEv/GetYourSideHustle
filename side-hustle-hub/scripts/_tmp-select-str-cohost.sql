SELECT guide_id,
       json_extract(patch_json, '$.assignee') AS assignee,
       json_extract(patch_json, '$.steps') AS steps,
       json_extract(patch_json, '$.tools') AS tools,
       json_extract(patch_json, '$.supplies') AS supplies,
       json_extract(patch_json, '$.prerequisites') AS prereqs,
       json_extract(patch_json, '$.suggestedPricing') AS pricing,
       json_extract(patch_json, '$.minTier') AS minTier,
       json_extract(patch_json, '$.published') AS published
FROM guide_catalog_state
WHERE guide_id = 'str-cohost';
