-- Unified lead / intake events (CTA clicks, completed opt-ins, newsletter, lead magnets).

CREATE TABLE IF NOT EXISTS public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type text NOT NULL,
  lead_status text NOT NULL DEFAULT 'intent'
    CHECK (lead_status IN ('intent', 'completed')),
  email text,
  full_name text,
  phone text,
  scenario_code text,
  path text,
  source_url text,
  referrer text,
  cta_label text,
  ip_address text,
  user_agent text,
  expert_contact_request_id uuid REFERENCES public.expert_contact_requests(id) ON DELETE SET NULL,
  email_signup_id uuid REFERENCES public.email_signups(id) ON DELETE SET NULL,
  client_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_events_type_check CHECK (
    lead_type IN (
      'agent_cta_click',
      'agent_opt_in_submit',
      'newsletter_signup',
      'lead_magnet_signup'
    )
  )
);

CREATE INDEX IF NOT EXISTS lead_events_type_created_idx
  ON public.lead_events (lead_type, created_at DESC);

CREATE INDEX IF NOT EXISTS lead_events_created_at_idx
  ON public.lead_events (created_at DESC);

CREATE INDEX IF NOT EXISTS lead_events_scenario_code_idx
  ON public.lead_events (scenario_code)
  WHERE scenario_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS lead_events_email_idx
  ON public.lead_events (lower(email))
  WHERE email IS NOT NULL;

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff read lead events" ON public.lead_events;
CREATE POLICY "staff read lead events"
  ON public.lead_events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'leads_admin'::app_role)
  );
