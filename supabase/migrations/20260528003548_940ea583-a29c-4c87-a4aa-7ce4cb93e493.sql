-- audit_logs: deny all writes to non-service-role
CREATE POLICY "audit_logs service_role writes only - insert"
ON public.audit_logs
AS RESTRICTIVE
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "audit_logs service_role writes only - update"
ON public.audit_logs
AS RESTRICTIVE
FOR UPDATE
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "audit_logs service_role writes only - delete"
ON public.audit_logs
AS RESTRICTIVE
FOR DELETE
TO public
USING (auth.role() = 'service_role');

-- scenarios: restrict who can insert
CREATE POLICY "scenarios insert role-gated"
ON public.scenarios
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'advisor'::app_role)
  OR has_role(auth.uid(), 'agent'::app_role)
  OR has_role(auth.uid(), 'qa'::app_role)
);

CREATE POLICY "scenarios insert role-gated baseline"
ON public.scenarios
AS RESTRICTIVE
FOR INSERT
TO public
WITH CHECK (
  auth.role() = 'service_role'
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'advisor'::app_role)
  OR has_role(auth.uid(), 'agent'::app_role)
  OR has_role(auth.uid(), 'qa'::app_role)
);