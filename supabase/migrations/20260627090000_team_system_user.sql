-- System user for shared team rows (editorial calendar + submission checklist).
-- Safe to re-run; inserts only when missing.

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

-- Backfill editorial team row when system user exists but row was never seeded.
INSERT INTO public.editorial_calendar_progress (user_id, completed_tasks, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '{}'::jsonb,
  now()
)
ON CONFLICT (user_id) DO NOTHING;
