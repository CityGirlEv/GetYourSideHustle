-- Restrict realtime.messages so only QA/admin users can subscribe to broadcasts.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "QA and admins can read realtime messages" ON realtime.messages;
CREATE POLICY "QA and admins can read realtime messages"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'qa'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "QA and admins can send realtime messages" ON realtime.messages;
CREATE POLICY "QA and admins can send realtime messages"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'qa'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );
