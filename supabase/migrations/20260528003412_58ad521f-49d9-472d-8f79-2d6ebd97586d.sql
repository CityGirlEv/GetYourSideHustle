CREATE POLICY "nda_signatures immutable for users - no update"
ON public.nda_signatures
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "nda_signatures immutable for users - no delete"
ON public.nda_signatures
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);