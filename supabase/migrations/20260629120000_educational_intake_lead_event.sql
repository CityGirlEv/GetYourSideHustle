-- Allow educational intake submissions in unified lead_events log.

ALTER TABLE public.lead_events
  DROP CONSTRAINT IF EXISTS lead_events_type_check;

ALTER TABLE public.lead_events
  ADD CONSTRAINT lead_events_type_check CHECK (
    lead_type IN (
      'agent_cta_click',
      'agent_opt_in_submit',
      'newsletter_signup',
      'lead_magnet_signup',
      'educational_intake_submit'
    )
  );
