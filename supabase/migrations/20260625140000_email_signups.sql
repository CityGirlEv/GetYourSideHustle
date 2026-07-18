-- Newsletter + lead-magnet email capture with consent audit trail.

CREATE TABLE IF NOT EXISTS public.email_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text NOT NULL,
  signup_kind text NOT NULL CHECK (signup_kind IN ('newsletter', 'lead_magnet')),
  lead_magnet_slug text,
  full_name text,
  ip_address text,
  user_agent text,
  source_url text,
  consent_flow_version text NOT NULL,
  consent_text text NOT NULL,
  consent_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_signups_lead_magnet_slug_check CHECK (
    (signup_kind = 'lead_magnet' AND lead_magnet_slug IS NOT NULL)
    OR (signup_kind = 'newsletter' AND lead_magnet_slug IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS email_signups_newsletter_email_idx
  ON public.email_signups (email_normalized)
  WHERE signup_kind = 'newsletter';

CREATE UNIQUE INDEX IF NOT EXISTS email_signups_lead_magnet_email_slug_idx
  ON public.email_signups (email_normalized, lead_magnet_slug)
  WHERE signup_kind = 'lead_magnet';

CREATE INDEX IF NOT EXISTS email_signups_submitted_at_idx
  ON public.email_signups (submitted_at DESC);

CREATE INDEX IF NOT EXISTS email_signups_kind_idx
  ON public.email_signups (signup_kind, submitted_at DESC);

ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff read email signups" ON public.email_signups;
CREATE POLICY "staff read email signups"
  ON public.email_signups FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'leads_admin'::app_role)
  );
