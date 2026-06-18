-- Outbound content dispatch log (newsletters, social schedules, publishes)

CREATE TABLE IF NOT EXISTS public.content_dispatch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL
    CHECK (channel IN ('newsletter', 'facebook_post', 'article', 'lead_magnet', 'broadcast')),
  dispatch_kind text NOT NULL
    CHECK (dispatch_kind IN ('test', 'scheduled', 'publish', 'broadcast')),
  draft_id uuid REFERENCES public.content_drafts (id) ON DELETE SET NULL,
  batch_id uuid REFERENCES public.content_batches (id) ON DELETE SET NULL,
  recipient text,
  subject text NOT NULL DEFAULT '',
  template_label text NOT NULL DEFAULT '',
  body_preview text,
  body_hash text,
  message_id text,
  status text NOT NULL
    CHECK (status IN ('pending', 'queued', 'sent', 'failed', 'cancelled')),
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_dispatch_log_created
  ON public.content_dispatch_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_dispatch_log_draft
  ON public.content_dispatch_log (draft_id, created_at DESC)
  WHERE draft_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_dispatch_log_channel
  ON public.content_dispatch_log (channel, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.content_dispatch_log TO authenticated;
GRANT ALL ON public.content_dispatch_log TO service_role;

ALTER TABLE public.content_dispatch_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "admins read content dispatch log"
    ON public.content_dispatch_log FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "admins insert content dispatch log"
    ON public.content_dispatch_log FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "admins update content dispatch log"
    ON public.content_dispatch_log FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
