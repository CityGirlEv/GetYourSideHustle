-- Defense-in-depth: restrict writes on advisor_credits to service_role only
CREATE POLICY "service role only writes advisor_credits"
ON public.advisor_credits
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow the existing "own credits read" SELECT policy to keep working for authenticated users
-- by making the restrictive policy not apply to SELECT
DROP POLICY "service role only writes advisor_credits" ON public.advisor_credits;

CREATE POLICY "advisor_credits writes service_role only - insert"
ON public.advisor_credits AS RESTRICTIVE FOR INSERT TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "advisor_credits writes service_role only - update"
ON public.advisor_credits AS RESTRICTIVE FOR UPDATE TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "advisor_credits writes service_role only - delete"
ON public.advisor_credits AS RESTRICTIVE FOR DELETE TO public
USING (auth.role() = 'service_role');

-- Defense-in-depth: restrictive policy on email_unsubscribe_tokens denying any non-service-role access
CREATE POLICY "email_unsubscribe_tokens service_role only"
ON public.email_unsubscribe_tokens
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
