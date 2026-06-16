-- Leads Admin: platform owner sees all scenarios; regular admins see only scenarios they created.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'leads_admin';

DROP POLICY IF EXISTS "admins full access scenarios" ON public.scenarios;

CREATE POLICY "leads_admin full access scenarios"
  ON public.scenarios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'leads_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'leads_admin'::app_role));

CREATE POLICY "admins manage own scenarios"
  ON public.scenarios FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND created_by IS NOT NULL
    AND created_by = auth.uid()
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND created_by IS NOT NULL
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "scenarios update admin/service only" ON public.scenarios;
CREATE POLICY "scenarios update admin/service only"
ON public.scenarios
AS RESTRICTIVE
FOR UPDATE
TO public
USING (
  auth.role() = 'service_role'
  OR public.has_role(auth.uid(), 'leads_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND created_by IS NOT NULL
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  auth.role() = 'service_role'
  OR public.has_role(auth.uid(), 'leads_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND created_by IS NOT NULL
    AND created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "scenarios delete admin/service only" ON public.scenarios;
CREATE POLICY "scenarios delete admin/service only"
ON public.scenarios
AS RESTRICTIVE
FOR DELETE
TO public
USING (
  auth.role() = 'service_role'
  OR public.has_role(auth.uid(), 'leads_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND created_by IS NOT NULL
    AND created_by = auth.uid()
  )
);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'leads_admin'::app_role
FROM auth.users
WHERE lower(email) = 'evelyn3@cox.net'
ON CONFLICT (user_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.enforce_leads_admin_owner_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  IF TG_OP = 'DELETE' AND OLD.role = 'leads_admin'::app_role THEN
    SELECT id INTO owner_id FROM auth.users WHERE lower(email) = 'evelyn3@cox.net' LIMIT 1;
    IF owner_id IS NULL OR OLD.user_id <> owner_id THEN
      RAISE EXCEPTION 'Leads Admin role is restricted to the platform owner account';
    END IF;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.role = 'leads_admin'::app_role THEN
    SELECT id INTO owner_id FROM auth.users WHERE lower(email) = 'evelyn3@cox.net' LIMIT 1;
    IF owner_id IS NULL OR NEW.user_id <> owner_id THEN
      RAISE EXCEPTION 'Leads Admin role can only exist on the platform owner account';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_leads_admin_user ON public.user_roles;
CREATE TRIGGER trg_enforce_leads_admin_user
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_leads_admin_owner_user();

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user uuid, p_role app_role)
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
  IF p_user IS NULL THEN RAISE EXCEPTION 'Invalid user'; END IF;
  IF p_role = 'leads_admin'::app_role THEN
    RAISE EXCEPTION 'Use the Leads Admin role controls to assign leads_admin';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = p_user;
  INSERT INTO public.user_roles(user_id, role) VALUES (p_user, p_role);

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'SET_USER_ROLE', 'user', p_user::text,
          jsonb_build_object('role', p_role));
END;
$$;

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

  UPDATE public.scenarios SET assigned_agent_id = p_agent WHERE id = p_scenario;

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'ASSIGN_AGENT', 'scenario', p_scenario::text,
          jsonb_build_object('agent_id', p_agent));
END;
$$;
