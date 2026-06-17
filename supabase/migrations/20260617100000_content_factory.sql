-- AI Content Factory: batches, draft queue, version history

CREATE TABLE public.content_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  topic text NOT NULL DEFAULT '',
  batch_kind text NOT NULL DEFAULT 'weekly'
    CHECK (batch_kind IN ('weekly', 'manual')),
  status text NOT NULL DEFAULT 'ready'
    CHECK (status IN ('generating', 'ready', 'failed')),
  asset_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_content_batches_created_at ON public.content_batches (created_at DESC);

CREATE TABLE public.content_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES public.content_batches (id) ON DELETE SET NULL,
  type text NOT NULL
    CHECK (type IN ('article', 'facebook_post', 'newsletter', 'faq', 'lead_magnet', 'image_prompt')),
  slot_index int NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'approved', 'scheduled', 'published', 'rejected')),
  scheduled_for timestamptz,
  published_at timestamptz,
  published_ref text,
  rejection_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_drafts_batch_id ON public.content_drafts (batch_id);
CREATE INDEX idx_content_drafts_status_type ON public.content_drafts (status, type);
CREATE INDEX idx_content_drafts_scheduled_for ON public.content_drafts (scheduled_for)
  WHERE status = 'scheduled';

CREATE TABLE public.content_draft_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.content_drafts (id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_draft_versions_draft_id ON public.content_draft_versions (draft_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_batches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_drafts TO authenticated;
GRANT SELECT, INSERT ON public.content_draft_versions TO authenticated;
GRANT ALL ON public.content_batches TO service_role;
GRANT ALL ON public.content_drafts TO service_role;
GRANT ALL ON public.content_draft_versions TO service_role;

ALTER TABLE public.content_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_draft_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read content batches"
  ON public.content_batches FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert content batches"
  ON public.content_batches FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update content batches"
  ON public.content_batches FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins read content drafts"
  ON public.content_drafts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert content drafts"
  ON public.content_drafts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update content drafts"
  ON public.content_drafts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins read content draft versions"
  ON public.content_draft_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert content draft versions"
  ON public.content_draft_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
