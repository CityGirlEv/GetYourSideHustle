
-- 1) test_results
CREATE TABLE public.test_results (
  test_id text PRIMARY KEY,
  status text,
  severity text,
  assignee text,
  sprint_id text,
  description_override jsonb,
  qa_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  dev_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_results TO authenticated;
GRANT ALL ON public.test_results TO service_role;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin/qa read test_results"
  ON public.test_results FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role));

CREATE POLICY "admin/qa insert test_results"
  ON public.test_results FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role));

CREATE POLICY "admin/qa update test_results"
  ON public.test_results FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'qa'::app_role));

CREATE POLICY "admin delete test_results"
  ON public.test_results FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_test_results_touch
  BEFORE UPDATE ON public.test_results
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) task_rows
CREATE TABLE public.task_rows (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_rows TO authenticated;
GRANT ALL ON public.task_rows TO service_role;
ALTER TABLE public.task_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin all task_rows"
  ON public.task_rows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_task_rows_touch
  BEFORE UPDATE ON public.task_rows
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) test_evidence_index
CREATE TABLE public.test_evidence_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_test_evidence_index_test ON public.test_evidence_index(test_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_evidence_index TO authenticated;
GRANT ALL ON public.test_evidence_index TO service_role;
ALTER TABLE public.test_evidence_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin/qa read evidence index"
  ON public.test_evidence_index FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'qa'::app_role)
    OR uploaded_by = auth.uid()
  );

CREATE POLICY "users insert own evidence index"
  ON public.test_evidence_index FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "users delete own evidence index"
  ON public.test_evidence_index FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
