-- Shared editorial calendar checklist: all admins see the same completed tasks.

-- Merge every admin's saved checkboxes into one team row (preserves Evelyn's work for Catria, etc.).
WITH all_tasks AS (
  SELECT DISTINCT key
  FROM public.editorial_calendar_progress,
  LATERAL jsonb_each(completed_tasks) AS e(key, value)
  WHERE value = 'true'::jsonb
),
merged AS (
  SELECT COALESCE(jsonb_object_agg(key, 'true'::jsonb), '{}'::jsonb) AS tasks
  FROM all_tasks
)
INSERT INTO public.editorial_calendar_progress (user_id, completed_tasks, updated_at)
SELECT '00000000-0000-0000-0000-000000000001'::uuid, tasks, now()
FROM merged
ON CONFLICT (user_id) DO UPDATE
SET
  completed_tasks = EXCLUDED.completed_tasks,
  updated_at = now();

-- Admins can read the shared team row (client may query directly in future).
CREATE POLICY "admins read team calendar progress"
  ON public.editorial_calendar_progress FOR SELECT TO authenticated
  USING (
    user_id = '00000000-0000-0000-0000-000000000001'::uuid
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'leads_admin'::app_role)
    )
  );
