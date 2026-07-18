-- Sync editorial calendar checkbox progress across devices (per admin user).

CREATE TABLE public.editorial_calendar_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  completed_tasks jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.editorial_calendar_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read own calendar progress"
  ON public.editorial_calendar_progress FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "admins upsert own calendar progress"
  ON public.editorial_calendar_progress FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "admins update own calendar progress"
  ON public.editorial_calendar_progress FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

GRANT SELECT, INSERT, UPDATE ON public.editorial_calendar_progress TO authenticated;
GRANT ALL ON public.editorial_calendar_progress TO service_role;
