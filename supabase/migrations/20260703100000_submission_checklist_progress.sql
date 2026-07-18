-- Shared compliance checklist progress for admin team (Evelyn + Catria).
-- Requires team system user from 20260627090000_team_system_user.sql.

CREATE TABLE IF NOT EXISTS public.submission_checklist_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  checklist_id text NOT NULL DEFAULT 'pbo-submission-checklist-v4',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_checklist_progress ENABLE ROW LEVEL SECURITY;

-- Seed empty team row (reuses editorial calendar system user in auth.users).
INSERT INTO public.submission_checklist_progress (user_id, checklist_id, state, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'pbo-submission-checklist-v4',
  '{}'::jsonb,
  now()
)
ON CONFLICT (user_id) DO NOTHING;

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

GRANT SELECT ON public.submission_checklist_progress TO authenticated;
GRANT ALL ON public.submission_checklist_progress TO service_role;
