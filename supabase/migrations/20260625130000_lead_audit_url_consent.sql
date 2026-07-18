-- Capture IP, submission URL, and consent text on all expert opt-in leads.

ALTER TABLE public.expert_contact_requests
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

ALTER TABLE public.lead_certificates
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS consent_text text;

CREATE INDEX IF NOT EXISTS expert_contact_requests_submitted_at_idx
  ON public.expert_contact_requests(submitted_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS lead_certificates_source_url_idx
  ON public.lead_certificates(source_url)
  WHERE source_url IS NOT NULL;
