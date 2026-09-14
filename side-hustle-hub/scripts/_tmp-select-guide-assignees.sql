SELECT guide_id,
       published,
       json_extract(patch_json, '$.assignee') AS assignee
FROM guide_catalog_state
ORDER BY guide_id;
