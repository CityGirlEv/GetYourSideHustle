CREATE TABLE public.email_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  source text NOT NULL DEFAULT 'override',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX email_template_versions_name_created_idx
  ON public.email_template_versions (template_name, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.email_template_versions TO authenticated;
GRANT ALL ON public.email_template_versions TO service_role;

ALTER TABLE public.email_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read template versions"
  ON public.email_template_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert template versions"
  ON public.email_template_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete template versions"
  ON public.email_template_versions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));