
-- admin_notifications: restrictive INSERT — only service_role can insert
CREATE POLICY "Only service_role can insert admin_notifications"
ON public.admin_notifications
AS RESTRICTIVE
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

-- scenario_lookup_attempts: restrictive — block UPDATE/DELETE for non-service_role
CREATE POLICY "Block updates to scenario_lookup_attempts"
ON public.scenario_lookup_attempts
AS RESTRICTIVE
FOR UPDATE
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Block deletes to scenario_lookup_attempts"
ON public.scenario_lookup_attempts
AS RESTRICTIVE
FOR DELETE
TO public
USING (auth.role() = 'service_role');
