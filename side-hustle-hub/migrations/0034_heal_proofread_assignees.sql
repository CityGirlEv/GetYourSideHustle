-- Proofread pairs encode owner in the id (PROOF-NNN-TINA / PROOF-NNN-LYRIQ).
-- Status rows were often saved with empty assignee, which dropped them from tester counts.
-- Only heal blank assignees — leave Fail→Evelyn (or other) reassignments alone.
UPDATE test_case_status
SET assignee = 'tina'
WHERE case_id LIKE 'PROOF-%-TINA'
  AND TRIM(COALESCE(assignee, '')) = '';

UPDATE test_case_status
SET assignee = 'lyriq'
WHERE case_id LIKE 'PROOF-%-LYRIQ'
  AND TRIM(COALESCE(assignee, '')) = '';
