ALTER TABLE public.test_results
  ADD COLUMN IF NOT EXISTS checked_steps jsonb NOT NULL DEFAULT '{"steps":[],"substeps":[]}'::jsonb;