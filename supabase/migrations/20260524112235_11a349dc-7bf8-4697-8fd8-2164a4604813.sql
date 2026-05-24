
-- Scenario columns
ALTER TABLE public.scenarios
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS assigned_agent_id uuid,
  ADD COLUMN IF NOT EXISTS agent_notes text,
  ADD COLUMN IF NOT EXISTS wants_contact boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS scenarios_created_by_idx ON public.scenarios(created_by);
CREATE INDEX IF NOT EXISTS scenarios_assigned_agent_idx ON public.scenarios(assigned_agent_id);

-- Rewrite scenario RLS
DROP POLICY IF EXISTS "admins read all scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "advisors read own claimed scenarios" ON public.scenarios;

CREATE POLICY "admins full access scenarios"
  ON public.scenarios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "qa read all scenarios"
  ON public.scenarios FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'qa'::app_role));

CREATE POLICY "creators read own scenarios"
  ON public.scenarios FOR SELECT TO authenticated
  USING (created_by IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "agents read assigned scenarios"
  ON public.scenarios FOR SELECT TO authenticated
  USING (assigned_agent_id IS NOT NULL AND assigned_agent_id = auth.uid()
         AND public.has_role(auth.uid(), 'agent'::app_role));

CREATE POLICY "advisors read own claimed scenarios"
  ON public.scenarios FOR SELECT TO authenticated
  USING (claimed_by = auth.uid());

-- Capture creator on new scenarios
CREATE OR REPLACE FUNCTION public.create_scenario(
  p_birth_year integer, p_zip3 text, p_gender text, p_tobacco boolean,
  p_income_band text, p_cost_preference text,
  p_medications jsonb, p_conditions jsonb, p_preferences jsonb
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
  v_attempts int := 0;
BEGIN
  IF p_birth_year IS NULL OR p_birth_year < 1900 OR p_birth_year > extract(year from now())::int THEN
    RAISE EXCEPTION 'Invalid birth year';
  END IF;
  IF p_zip3 IS NULL OR p_zip3 !~ '^[0-9]{3}$' THEN
    RAISE EXCEPTION 'Invalid ZIP3';
  END IF;
  IF jsonb_array_length(COALESCE(p_medications,'[]'::jsonb)) > 50 THEN
    RAISE EXCEPTION 'Too many medications';
  END IF;
  IF jsonb_array_length(COALESCE(p_conditions,'[]'::jsonb)) > 50 THEN
    RAISE EXCEPTION 'Too many conditions';
  END IF;

  LOOP
    v_code := gen_scenario_code();
    v_attempts := v_attempts + 1;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.scenarios WHERE scenario_code = v_code);
    IF v_attempts > 8 THEN RAISE EXCEPTION 'Could not generate unique code'; END IF;
  END LOOP;

  INSERT INTO public.scenarios (
    scenario_code, birth_year, zip3, gender, tobacco, income_band,
    cost_preference, medications, conditions, preferences, created_by
  ) VALUES (
    v_code, p_birth_year, p_zip3, p_gender, COALESCE(p_tobacco,false),
    p_income_band, COALESCE(p_cost_preference,'minimize_monthly'),
    COALESCE(p_medications,'[]'::jsonb),
    COALESCE(p_conditions,'[]'::jsonb),
    COALESCE(p_preferences,'{}'::jsonb),
    auth.uid()
  );
  RETURN v_code;
END;
$function$;

-- Trigger: opt-in flag
CREATE OR REPLACE FUNCTION public.mark_scenario_wants_contact()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.scenario_code IS NOT NULL THEN
    UPDATE public.scenarios SET wants_contact = true WHERE scenario_code = NEW.scenario_code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_wants_contact ON public.expert_contact_requests;
CREATE TRIGGER trg_mark_wants_contact
  AFTER INSERT ON public.expert_contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.mark_scenario_wants_contact();

UPDATE public.scenarios s SET wants_contact = true
WHERE EXISTS (SELECT 1 FROM public.expert_contact_requests r WHERE r.scenario_code = s.scenario_code);

-- Default new users → viewer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');

  INSERT INTO public.advisor_credits (advisor_id, balance)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$function$;

-- admin_set_user_role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user uuid, p_role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;
  IF p_user IS NULL THEN RAISE EXCEPTION 'Invalid user'; END IF;

  DELETE FROM public.user_roles WHERE user_id = p_user;
  INSERT INTO public.user_roles(user_id, role) VALUES (p_user, p_role);

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'SET_USER_ROLE', 'user', p_user::text,
          jsonb_build_object('role', p_role));
END;
$$;

-- admin_assign_agent
CREATE OR REPLACE FUNCTION public.admin_assign_agent(p_scenario uuid, p_agent uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;
  IF p_scenario IS NULL THEN RAISE EXCEPTION 'Scenario required'; END IF;

  IF p_agent IS NOT NULL AND NOT public.has_role(p_agent, 'agent'::app_role) THEN
    RAISE EXCEPTION 'Target user is not an agent';
  END IF;

  UPDATE public.scenarios SET assigned_agent_id = p_agent WHERE id = p_scenario;

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'ASSIGN_AGENT', 'scenario', p_scenario::text,
          jsonb_build_object('agent_id', p_agent));
END;
$$;

-- agent_update_notes
CREATE OR REPLACE FUNCTION public.agent_update_notes(p_scenario uuid, p_notes text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_assigned uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_notes IS NOT NULL AND length(p_notes) > 10000 THEN RAISE EXCEPTION 'Notes too long'; END IF;

  SELECT assigned_agent_id INTO v_assigned FROM public.scenarios WHERE id = p_scenario;
  IF v_assigned IS NULL OR v_assigned <> v_uid THEN
    RAISE EXCEPTION 'Not assigned to this scenario';
  END IF;

  UPDATE public.scenarios SET agent_notes = p_notes WHERE id = p_scenario;

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'AGENT_UPDATE_NOTES', 'scenario', p_scenario::text, '{}'::jsonb);
END;
$$;
