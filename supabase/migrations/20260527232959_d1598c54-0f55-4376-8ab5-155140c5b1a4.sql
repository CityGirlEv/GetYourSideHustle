
CREATE TABLE public.custom_tests (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P2',
  preconditions TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected TEXT NOT NULL DEFAULT '',
  notes TEXT,
  assignee TEXT,
  sprint_id TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_tests TO authenticated;
GRANT ALL ON public.custom_tests TO service_role;

ALTER TABLE public.custom_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin/qa read custom_tests"
  ON public.custom_tests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role));

CREATE POLICY "admin/qa insert custom_tests"
  ON public.custom_tests FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role))
    AND created_by = auth.uid()
  );

CREATE POLICY "admin/qa update custom_tests"
  ON public.custom_tests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role));

CREATE POLICY "admin delete custom_tests"
  ON public.custom_tests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER custom_tests_updated_at
  BEFORE UPDATE ON public.custom_tests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
