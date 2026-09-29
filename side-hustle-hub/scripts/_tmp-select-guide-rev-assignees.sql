SELECT case_id, assignee
FROM test_case_status
WHERE case_id LIKE 'GUIDE-REV-%'
ORDER BY case_id;
