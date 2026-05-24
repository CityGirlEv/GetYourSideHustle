
CREATE OR REPLACE FUNCTION public.update_scenario(
  p_scenario_id uuid,
  p_birth_year integer,
  p_zip3 text,
  p_gender text,
  p_tobacco boolean,
  p_income_band text,
  p_cost_preference text,
  p_medications jsonb,
  p_conditions jsonb,
  p_preferences jsonb
)
RETURNS public.scenarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.scenarios;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  SELECT * INTO v_row FROM public.scenarios WHERE id = p_scenario_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'Scenario not found'; END IF;

  IF NOT (v_row.claimed_by = v_uid
       OR v_row.created_by = v_uid
       OR public.has_role(v_uid, 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Not allowed to edit this scenario';
  END IF;

  IF p_birth_year IS NULL OR p_birth_year < 1900 OR p_birth_year > extract(year from now())::int THEN
    RAISE EXCEPTION 'Invalid birth year';
  END IF;
  IF p_zip3 IS NULL OR p_zip3 !~ '^[0-9]{3}$' THEN RAISE EXCEPTION 'Invalid ZIP3'; END IF;
  IF jsonb_array_length(COALESCE(p_medications,'[]'::jsonb)) > 50 THEN RAISE EXCEPTION 'Too many medications'; END IF;
  IF jsonb_array_length(COALESCE(p_conditions,'[]'::jsonb)) > 50 THEN RAISE EXCEPTION 'Too many conditions'; END IF;

  UPDATE public.scenarios SET
    birth_year      = p_birth_year,
    zip3            = p_zip3,
    gender          = p_gender,
    tobacco         = COALESCE(p_tobacco, false),
    income_band     = p_income_band,
    cost_preference = COALESCE(p_cost_preference, 'minimize_monthly'),
    medications     = COALESCE(p_medications, '[]'::jsonb),
    conditions      = COALESCE(p_conditions, '[]'::jsonb),
    preferences     = COALESCE(p_preferences, '{}'::jsonb)
  WHERE id = p_scenario_id
  RETURNING * INTO v_row;

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'UPDATE_SCENARIO', 'scenario', p_scenario_id::text, '{}'::jsonb);

  RETURN v_row;
END;
$$;
