SELECT guide_id,
       json_extract(patch_json, '$.assignee') AS assignee,
       json_extract(patch_json, '$.name') AS name,
       json_extract(patch_json, '$.steps') AS steps,
       json_extract(patch_json, '$.tools') AS tools,
       json_extract(patch_json, '$.supplies') AS supplies,
       json_extract(patch_json, '$.suggestedPricing') AS suggestedPricing,
       json_extract(patch_json, '$.prerequisites') AS prerequisites,
       json_extract(patch_json, '$.minTier') AS minTier
FROM guide_catalog_state
WHERE guide_id = 'ai-timing';
