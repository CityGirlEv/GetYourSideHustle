-- Lead certificates: immutable consent audit trail for expert opt-in / assistance requests.

ALTER TABLE public.expert_contact_requests
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agency_name text;

CREATE TABLE IF NOT EXISTS public.lead_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_contact_request_id uuid REFERENCES public.expert_contact_requests(id) ON DELETE SET NULL,
  consumer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  scenario_code text,
  agency_name text NOT NULL,
  assigned_agent_id uuid,
  assigned_agent_name text,
  ip_address text,
  user_agent text,
  client_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  consent_snapshot jsonb NOT NULL,
  privacy_acknowledged boolean NOT NULL DEFAULT true,
  contact_authorized boolean NOT NULL DEFAULT true,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expert_contact_requests
  ADD COLUMN IF NOT EXISTS lead_certificate_id uuid REFERENCES public.lead_certificates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS lead_certificates_submitted_at_idx
  ON public.lead_certificates(submitted_at DESC);

CREATE INDEX IF NOT EXISTS lead_certificates_email_idx
  ON public.lead_certificates(lower(email));

ALTER TABLE public.lead_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff read lead certificates" ON public.lead_certificates;
CREATE POLICY "staff read lead certificates"
  ON public.lead_certificates FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'leads_admin'::app_role)
  );

DROP POLICY IF EXISTS "leads_admin read expert contact requests" ON public.expert_contact_requests;
CREATE POLICY "leads_admin read expert contact requests"
  ON public.expert_contact_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'leads_admin'::app_role));
