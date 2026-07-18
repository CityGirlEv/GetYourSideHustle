-- Remap GYSH task categories to T/E operational taxonomy.
-- Column already exists (TEXT); this is a data migration only.

-- Per-task assignments for the seeded backlog
UPDATE tasks SET category = 'assets_brand' WHERE id = 'T-001';
UPDATE tasks SET category = 'kids_corner' WHERE id = 'T-002';
UPDATE tasks SET category = 'facebook_social' WHERE id = 'T-003';
UPDATE tasks SET category = 'website' WHERE id = 'T-004';
UPDATE tasks SET category = 'website' WHERE id = 'T-005';
UPDATE tasks SET category = 'admin_ops' WHERE id = 'T-006';
UPDATE tasks SET category = 'content' WHERE id = 'T-007';
UPDATE tasks SET category = 'youtube_kevina' WHERE id = 'T-008';
UPDATE tasks SET category = 'website' WHERE id = 'T-009';
UPDATE tasks SET category = 'kids_corner' WHERE id = 'T-010';
UPDATE tasks SET category = 'assets_brand' WHERE id = 'T-011';
UPDATE tasks SET category = 'website' WHERE id = 'T-012';
UPDATE tasks SET category = 'admin_ops' WHERE id = 'T-013';
UPDATE tasks SET category = 'youtube_kevina' WHERE id = 'T-014';
UPDATE tasks SET category = 'admin_ops' WHERE id = 'T-015';

-- Legacy slug → new taxonomy (any other / manually created tasks)
UPDATE tasks SET category = 'assets_brand' WHERE category = 'brand';
UPDATE tasks SET category = 'website' WHERE category = 'product';
UPDATE tasks SET category = 'admin_ops' WHERE category IN ('ops', 'qa');
-- 'content' stays 'content'

-- Anything still unknown → Other
UPDATE tasks SET category = 'other'
WHERE category NOT IN (
  'website',
  'facebook_social',
  'youtube_kevina',
  'assets_brand',
  'kids_corner',
  'workshops',
  'admin_ops',
  'email_resend',
  'content',
  'launch_marketing',
  'other'
);
