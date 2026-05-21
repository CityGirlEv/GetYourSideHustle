-- ============================================================
-- PIVOT: Remove HIPAA encryption vault. Replace with
-- de-identified Safe-Harbor scenarios accessed by code.
-- ============================================================

-- 1. Drop old encrypted PHI tables and the encryption key store
DROP TABLE IF EXISTS public.soas_encrypted CASCADE;
DROP TABLE IF EXISTS public.clients_encrypted CASCADE;
DROP TABLE IF EXISTS public.encryption_keys CASCADE;

-- 2. Profiles no longer need HIPAA acknowledgment
ALTER TABLE public.profiles DROP COLUMN IF EXISTS hipaa_acknowledged_at;

-- 3. Scenarios table — de-identified, Safe Harbor §164.514 compliant.
--    NO RLS policies on this table; all access is gated through
--    SECURITY DEFINER functions below (deny-by-default).
CREATE TABLE public.scenarios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_code   text NOT NULL UNIQUE,
  birth_year      int NOT NULL,
  zip3            text NOT NULL,
  gender          text,
  tobacco         boolean NOT NULL DEFAULT false,
  income_band     text,
  cost_preference text NOT NULL DEFAULT 'minimize_monthly',
  medications     jsonb NOT NULL DEFAULT '[]'::jsonb,
  conditions      jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferences     jsonb NOT NULL DEFAULT '{}'::jsonb,
  claimed_by      uuid,
  claimed_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  CONSTRAINT scenarios_birth_year_ck CHECK (birth_year BETWEEN 1900 AND 2100),
  CONSTRAINT scenarios_zip3_ck       CHECK (zip3 ~ '^[0-9]{3}$')
);
CREATE INDEX scenarios_code_idx       ON public.scenarios(scenario_code);
CREATE INDEX scenarios_claimed_by_idx ON public.scenarios(claimed_by);
CREATE INDEX scenarios_expires_idx    ON public.scenarios(expires_at);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
-- (intentionally no policies — only SECURITY DEFINER fns below grant access)

-- 4. Rate-limit log for advisor lookups
CREATE TABLE public.scenario_lookup_attempts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id      uuid NOT NULL,
  code_attempted  text NOT NULL,
  succeeded       boolean NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sla_advisor_time_idx
  ON public.scenario_lookup_attempts(advisor_id, created_at DESC);
ALTER TABLE public.scenario_lookup_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lookup attempts read"
  ON public.scenario_lookup_attempts FOR SELECT TO authenticated
  USING (auth.uid() = advisor_id);

-- 5. SOA table — now linked to scenarios (no PII)
CREATE TABLE public.soas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id  uuid NOT NULL,
  scenario_id uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  plan_type   text,
  status      text NOT NULL DEFAULT 'active',
  signed_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.soas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own soas all" ON public.soas FOR ALL TO authenticated
  USING (auth.uid() = advisor_id) WITH CHECK (auth.uid() = advisor_id);

-- 6. Scenario code generator: SCN-YYYY-XXXX-XXXX, unambiguous alphabet
CREATE OR REPLACE FUNCTION public.gen_scenario_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  alpha text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  body  text := '';
  i     int;
BEGIN
  FOR i IN 1..8 LOOP
    body := body || substr(alpha, 1 + floor(random() * length(alpha))::int, 1);
    IF i = 4 THEN body := body || '-'; END IF;
  END LOOP;
  RETURN 'SCN-' || extract(year from now())::text || '-' || body;
END;
$$;

-- 7. Public create_scenario — callable by anon (consumers, no login)
CREATE OR REPLACE FUNCTION public.create_scenario(
  p_birth_year      int,
  p_zip3            text,
  p_gender          text,
  p_tobacco         boolean,
  p_income_band     text,
  p_cost_preference text,
  p_medications     jsonb,
  p_conditions      jsonb,
  p_preferences     jsonb
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code     text;
  v_attempts int := 0;
BEGIN
  IF p_birth_year IS NULL OR p_birth_year < 1900
     OR p_birth_year > extract(year from now())::int THEN
    RAISE EXCEPTION 'Invalid birth year';
  END IF;
  IF p_zip3 IS NULL OR p_zip3 !~ '^[0-9]{3}$' THEN
    RAISE EXCEPTION 'Invalid ZIP3';
  END IF;
  IF jsonb_array_length(COALESCE(p_medications, '[]'::jsonb)) > 50 THEN
    RAISE EXCEPTION 'Too many medications';
  END IF;
  IF jsonb_array_length(COALESCE(p_conditions, '[]'::jsonb)) > 50 THEN
    RAISE EXCEPTION 'Too many conditions';
  END IF;

  LOOP
    v_code := gen_scenario_code();
    v_attempts := v_attempts + 1;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.scenarios WHERE scenario_code = v_code
    );
    IF v_attempts > 8 THEN
      RAISE EXCEPTION 'Could not generate unique code';
    END IF;
  END LOOP;

  INSERT INTO public.scenarios (
    scenario_code, birth_year, zip3, gender, tobacco, income_band,
    cost_preference, medications, conditions, preferences
  ) VALUES (
    v_code, p_birth_year, p_zip3, p_gender, COALESCE(p_tobacco, false),
    p_income_band, COALESCE(p_cost_preference, 'minimize_monthly'),
    COALESCE(p_medications, '[]'::jsonb),
    COALESCE(p_conditions, '[]'::jsonb),
    COALESCE(p_preferences, '{}'::jsonb)
  );

  RETURN v_code;
END;
$$;
REVOKE ALL ON FUNCTION public.create_scenario(int, text, text, boolean, text, text, jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_scenario(int, text, text, boolean, text, text, jsonb, jsonb, jsonb) TO anon, authenticated;

-- 8. Authenticated lookup — rate-limited, claim-on-first-view
CREATE OR REPLACE FUNCTION public.lookup_scenario(p_code text)
RETURNS public.scenarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          uuid := auth.uid();
  v_row          public.scenarios;
  v_recent_fails int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_code IS NULL OR length(p_code) < 8 OR length(p_code) > 64 THEN
    RAISE EXCEPTION 'Invalid scenario code format';
  END IF;

  SELECT count(*) INTO v_recent_fails
  FROM public.scenario_lookup_attempts
  WHERE advisor_id = v_uid
    AND succeeded = false
    AND created_at > now() - interval '1 minute';
  IF v_recent_fails >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded — wait a minute before trying again';
  END IF;

  SELECT * INTO v_row FROM public.scenarios
  WHERE scenario_code = p_code AND expires_at > now();

  IF v_row.id IS NULL THEN
    INSERT INTO public.scenario_lookup_attempts(advisor_id, code_attempted, succeeded)
    VALUES (v_uid, p_code, false);
    RAISE EXCEPTION 'Scenario not found or expired';
  END IF;

  IF v_row.claimed_by IS NULL THEN
    UPDATE public.scenarios
    SET claimed_by = v_uid, claimed_at = now()
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSIF v_row.claimed_by <> v_uid THEN
    INSERT INTO public.scenario_lookup_attempts(advisor_id, code_attempted, succeeded)
    VALUES (v_uid, p_code, false);
    RAISE EXCEPTION 'Scenario already claimed by another advisor';
  END IF;

  INSERT INTO public.scenario_lookup_attempts(advisor_id, code_attempted, succeeded)
  VALUES (v_uid, p_code, true);

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'LOOKUP_SCENARIO', 'scenario', v_row.id::text,
          jsonb_build_object('code', p_code));

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.lookup_scenario(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_scenario(text) TO authenticated;

-- 9. List scenarios this advisor has claimed
CREATE OR REPLACE FUNCTION public.my_scenarios()
RETURNS SETOF public.scenarios
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * FROM public.scenarios
  WHERE claimed_by = auth.uid() AND expires_at > now()
  ORDER BY claimed_at DESC NULLS LAST, created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.my_scenarios() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_scenarios() TO authenticated;
