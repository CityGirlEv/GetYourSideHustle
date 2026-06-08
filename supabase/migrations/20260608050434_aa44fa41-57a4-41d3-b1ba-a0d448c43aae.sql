
DO $$
DECLARE
  v_email text := 'evelyn3@cox.net';
  v_password text := 'TempAdmin2026!';
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      v_email, crypt(v_password, gen_salt('bf')),
      now(), NULL, NULL,
      jsonb_build_object('provider','email','providers',ARRAY['email']),
      jsonb_build_object('full_name','Evelyn Admin'),
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_uid, v_uid::text,
      jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      banned_until = NULL,
      deleted_at = NULL,
      updated_at = now(),
      raw_app_meta_data = COALESCE(raw_app_meta_data,'{}'::jsonb)
        || jsonb_build_object('provider','email','providers',ARRAY['email'])
    WHERE id = v_uid;

    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_uid AND provider = 'email') THEN
      INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_uid, v_uid::text,
        jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
        'email', now(), now(), now()
      );
    END IF;
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (v_uid, 'Evelyn Admin')
  ON CONFLICT (id) DO UPDATE SET full_name = COALESCE(NULLIF(public.profiles.full_name,''), EXCLUDED.full_name);

  DELETE FROM public.user_roles WHERE user_id = v_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin');

  INSERT INTO public.advisor_credits (advisor_id, balance)
  VALUES (v_uid, 0)
  ON CONFLICT (advisor_id) DO NOTHING;
END $$;
