-- Fix: scenario_lookup_attempts has no INSERT policy. Although inserts today
-- only happen via the lookup_scenario SECURITY DEFINER function (which
-- bypasses RLS), add an explicit WITH CHECK so any future direct insert
-- path is forced to use the caller's own advisor_id.
CREATE POLICY "own lookup attempts insert"
ON public.scenario_lookup_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = advisor_id);

-- Fix: suppressed_emails — add a restrictive deny-all baseline so only
-- service_role can read/write, regardless of any future permissive policies.
CREATE POLICY "suppressed_emails service_role only"
ON public.suppressed_emails
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Fix: task_rows — add a restrictive admin-only baseline so non-admin
-- authenticated users can never read or write, even if a permissive policy
-- is later added by mistake.
CREATE POLICY "task_rows admin only baseline"
ON public.task_rows
AS RESTRICTIVE
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));