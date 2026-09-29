SELECT
  SUM(CASE WHEN json_extract(patch_json,'$.steps') IS NOT NULL THEN 1 ELSE 0 END) AS steps,
  SUM(CASE WHEN json_extract(patch_json,'$.tools') IS NOT NULL THEN 1 ELSE 0 END) AS tools,
  SUM(CASE WHEN json_extract(patch_json,'$.supplies') IS NOT NULL THEN 1 ELSE 0 END) AS supplies,
  SUM(CASE WHEN json_extract(patch_json,'$.suggestedPricing') IS NOT NULL THEN 1 ELSE 0 END) AS pricing,
  SUM(CASE WHEN json_extract(patch_json,'$.prerequisites') IS NOT NULL THEN 1 ELSE 0 END) AS prereqs
FROM guide_catalog_state;

SELECT guide_id,
  CASE WHEN json_extract(patch_json,'$.steps') IS NOT NULL THEN 1 ELSE 0 END AS steps,
  CASE WHEN json_extract(patch_json,'$.tools') IS NOT NULL THEN 1 ELSE 0 END AS tools,
  CASE WHEN json_extract(patch_json,'$.supplies') IS NOT NULL THEN 1 ELSE 0 END AS supplies,
  CASE WHEN json_extract(patch_json,'$.suggestedPricing') IS NOT NULL THEN 1 ELSE 0 END AS pricing,
  CASE WHEN json_extract(patch_json,'$.prerequisites') IS NOT NULL THEN 1 ELSE 0 END AS prereqs
FROM guide_catalog_state
WHERE json_extract(patch_json,'$.steps') IS NOT NULL
   OR json_extract(patch_json,'$.tools') IS NOT NULL
   OR json_extract(patch_json,'$.supplies') IS NOT NULL
   OR json_extract(patch_json,'$.suggestedPricing') IS NOT NULL
   OR json_extract(patch_json,'$.prerequisites') IS NOT NULL
ORDER BY guide_id;
