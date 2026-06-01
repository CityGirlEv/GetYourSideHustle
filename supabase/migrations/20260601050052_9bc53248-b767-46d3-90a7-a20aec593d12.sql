
-- Email template overrides: admin-editable HTML/subject that takes precedence
-- over the in-code React Email templates at send time.
CREATE TABLE public.email_template_overrides (
  template_name text PRIMARY KEY,
  subject text NOT NULL,
  html text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_template_overrides TO authenticated;
GRANT ALL ON public.email_template_overrides TO service_role;

ALTER TABLE public.email_template_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read template overrides"
ON public.email_template_overrides
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert template overrides"
ON public.email_template_overrides
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update template overrides"
ON public.email_template_overrides
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete template overrides"
ON public.email_template_overrides
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER email_template_overrides_touch
BEFORE UPDATE ON public.email_template_overrides
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
