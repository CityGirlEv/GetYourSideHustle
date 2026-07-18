-- ActiveProspect TrustedForm certificate URLs captured on expert opt-in leads.

ALTER TABLE public.expert_contact_requests
  ADD COLUMN IF NOT EXISTS trustedform_cert_url text,
  ADD COLUMN IF NOT EXISTS trustedform_token text,
  ADD COLUMN IF NOT EXISTS trustedform_ping_url text;

ALTER TABLE public.lead_certificates
  ADD COLUMN IF NOT EXISTS trustedform_cert_url text,
  ADD COLUMN IF NOT EXISTS trustedform_token text,
  ADD COLUMN IF NOT EXISTS trustedform_ping_url text;

CREATE INDEX IF NOT EXISTS lead_certificates_trustedform_cert_url_idx
  ON public.lead_certificates(trustedform_cert_url)
  WHERE trustedform_cert_url IS NOT NULL;
