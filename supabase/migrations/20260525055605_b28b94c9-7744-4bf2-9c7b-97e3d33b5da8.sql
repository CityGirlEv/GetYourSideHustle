
-- NDA signatures table
CREATE TABLE public.nda_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  agreement_version TEXT NOT NULL DEFAULT 'v1',
  pdf_path TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agreement_version)
);

ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own NDA"
  ON public.nda_signatures FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own NDA"
  ON public.nda_signatures FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin/QA read all NDAs"
  ON public.nda_signatures FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'qa'::app_role));

-- Private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('nda-signatures', 'nda-signatures', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own NDA pdf"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'nda-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own NDA pdf"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'nda-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin/QA read all NDA pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'nda-signatures'
    AND (public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'qa'::app_role))
  );
