-- Idempotent setup for submission_checklist_progress (run once in Supabase SQL Editor).
-- Project: xiqknyrikpuysbkvpkju — same DB for dev (preview) and prod (Cloudflare Pages).
-- Dashboard: https://supabase.com/dashboard/project/xiqknyrikpuysbkvpkju/sql/new

-- 1) Team system user (FK target for shared rows)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'authenticated',
      'authenticated',
      'team-system@internal.mypartb',
      '',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"system_user":true}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000001'::uuid,
      jsonb_build_object(
        'sub', '00000000-0000-0000-0000-000000000001',
        'email', 'team-system@internal.mypartb'
      ),
      'email',
      '00000000-0000-0000-0000-000000000001',
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- 2) Checklist table + RLS + seed row
CREATE TABLE IF NOT EXISTS public.submission_checklist_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  checklist_id text NOT NULL DEFAULT 'pbo-submission-checklist-v4',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_checklist_progress ENABLE ROW LEVEL SECURITY;

INSERT INTO public.submission_checklist_progress (user_id, checklist_id, state, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'pbo-submission-checklist-v4',
  '{}'::jsonb,
  now()
)
ON CONFLICT (user_id) DO NOTHING;

DROP POLICY IF EXISTS "admins read team submission checklist" ON public.submission_checklist_progress;

CREATE POLICY "admins read team submission checklist"
  ON public.submission_checklist_progress FOR SELECT TO authenticated
  USING (
    user_id = '00000000-0000-0000-0000-000000000001'::uuid
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'leads_admin'::app_role)
    )
  );

GRANT SELECT ON public.submission_checklist_progress TO authenticated;
GRANT ALL ON public.submission_checklist_progress TO service_role;

-- 3) Backfill editorial calendar team row if missing (same system user)
INSERT INTO public.editorial_calendar_progress (user_id, completed_tasks, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '{}'::jsonb,
  now()
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify
SELECT 'submission_checklist_progress' AS check_name, count(*) AS row_count
FROM public.submission_checklist_progress
UNION ALL
SELECT 'team user in auth.users', count(*)
FROM auth.users
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
