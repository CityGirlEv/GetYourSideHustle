SELECT published, COUNT(*) AS n
FROM guide_catalog_state
GROUP BY published
ORDER BY published;

SELECT guide_id, published, deleted, json_extract(patch_json,'$.assignee') AS assignee
FROM guide_catalog_state
WHERE published = 1
ORDER BY guide_id;
