-- Align submission checklist team row with editorial calendar system user (auth.users FK).

DROP POLICY IF EXISTS "admins read team submission checklist" ON public.submission_checklist_progress;

CREATE POLICY "admins read team submission checklist"
  ON public.submission_checklist_progress FOR SELECT TO authenticated
  USING (
    user_id = '00000000-0000-0000-0000-000000000001'::uuid
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'leads_admin'::app_role)
    )
  );

INSERT INTO public.submission_checklist_progress (user_id, checklist_id, state, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'pbo-submission-checklist-v4',
  '{}'::jsonb,
  now()
)
ON CONFLICT (user_id) DO NOTHING;
