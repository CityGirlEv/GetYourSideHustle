-- Collapse full partner login names to short Assigned By labels (Tina / Evelyn / Lyriq).
-- "Tina Marie Barham" and "Tina" are the same person.
UPDATE tasks SET assign_by = 'Tina' WHERE assign_by IN ('Tina Marie Barham', 'Tina Marie');
UPDATE tasks SET assign_by = 'Evelyn' WHERE assign_by IN ('Evelyn Irving', 'Evelyn Partner');
UPDATE tasks SET assign_by = 'Lyriq' WHERE assign_by IN ('Lyriq Gaulden');

UPDATE test_case_status SET assigned_by = 'Tina' WHERE assigned_by IN ('Tina Marie Barham', 'Tina Marie');
UPDATE test_case_status SET assigned_by = 'Evelyn' WHERE assigned_by IN ('Evelyn Irving', 'Evelyn Partner');
UPDATE test_case_status SET assigned_by = 'Lyriq' WHERE assigned_by IN ('Lyriq Gaulden');
