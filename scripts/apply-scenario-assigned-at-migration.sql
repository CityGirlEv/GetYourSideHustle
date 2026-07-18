-- Idempotent: add scenarios.assigned_at + update admin_assign_agent RPC.
-- Project: xiqknyrikpuysbkvpkju
-- Dashboard: https://supabase.com/dashboard/project/xiqknyrikpuysbkvpkju/sql/new
-- Source migration: supabase/migrations/20260704100000_scenario_assigned_at.sql

-- 1) Column for when a scenario was last assigned to an agent
ALTER TABLE public.scenarios
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- 2) RPC: set assigned_agent_id and assigned_at together
CREATE OR REPLACE FUNCTION public.admin_assign_agent(p_scenario uuid, p_agent uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT (
    public.has_role(v_uid, 'admin'::app_role)
    OR public.has_role(v_uid, 'leads_admin'::app_role)
  ) THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;
  IF p_scenario IS NULL THEN RAISE EXCEPTION 'Scenario required'; END IF;

  IF p_agent IS NOT NULL AND NOT public.has_role(p_agent, 'agent'::app_role) THEN
    RAISE EXCEPTION 'Target user is not an agent';
  END IF;

  UPDATE public.scenarios
  SET
    assigned_agent_id = p_agent,
    assigned_at = CASE WHEN p_agent IS NULL THEN NULL ELSE now() END
  WHERE id = p_scenario;

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'ASSIGN_AGENT', 'scenario', p_scenario::text,
          jsonb_build_object('agent_id', p_agent));
END;
$$;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'scenarios'
  AND column_name = 'assigned_at';

SELECT proname, pg_get_functiondef(oid) LIKE '%assigned_at%' AS sets_assigned_at
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'admin_assign_agent';
