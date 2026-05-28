CREATE POLICY "scenarios update admin/service only"
ON public.scenarios
AS RESTRICTIVE
FOR UPDATE
TO public
USING (
  auth.role() = 'service_role'
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.role() = 'service_role'
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "scenarios delete admin/service only"
ON public.scenarios
AS RESTRICTIVE
FOR DELETE
TO public
USING (
  auth.role() = 'service_role'
  OR has_role(auth.uid(), 'admin'::app_role)
);