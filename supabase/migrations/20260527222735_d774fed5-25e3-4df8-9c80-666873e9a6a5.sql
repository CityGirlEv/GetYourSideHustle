
-- credit_txns: restrictive writes to service_role only
CREATE POLICY "credit_txns writes service_role only - insert"
ON public.credit_txns AS RESTRICTIVE FOR INSERT TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "credit_txns writes service_role only - update"
ON public.credit_txns AS RESTRICTIVE FOR UPDATE TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "credit_txns writes service_role only - delete"
ON public.credit_txns AS RESTRICTIVE FOR DELETE TO public
USING (auth.role() = 'service_role');

-- site_visits: restrictive writes to service_role only
CREATE POLICY "site_visits writes service_role only - insert"
ON public.site_visits AS RESTRICTIVE FOR INSERT TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "site_visits writes service_role only - update"
ON public.site_visits AS RESTRICTIVE FOR UPDATE TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "site_visits writes service_role only - delete"
ON public.site_visits AS RESTRICTIVE FOR DELETE TO public
USING (auth.role() = 'service_role');

-- nda-signatures storage bucket: restrict UPDATE and DELETE to service_role only
CREATE POLICY "nda-signatures update service_role only"
ON storage.objects AS RESTRICTIVE FOR UPDATE TO public
USING (bucket_id <> 'nda-signatures' OR auth.role() = 'service_role')
WITH CHECK (bucket_id <> 'nda-signatures' OR auth.role() = 'service_role');

CREATE POLICY "nda-signatures delete service_role only"
ON storage.objects AS RESTRICTIVE FOR DELETE TO public
USING (bucket_id <> 'nda-signatures' OR auth.role() = 'service_role');
