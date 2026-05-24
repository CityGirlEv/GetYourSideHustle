
-- Grant admin role to the Evelyn admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('37babcbf-4a0e-44fa-871e-f86b95aad059', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Make sure profile exists
INSERT INTO public.profiles (id, full_name)
VALUES ('37babcbf-4a0e-44fa-871e-f86b95aad059', 'Evelyn (Admin)')
ON CONFLICT (id) DO NOTHING;

-- Admins can read all scenarios
CREATE POLICY "admins read all scenarios"
  ON public.scenarios FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add optional context columns to expert_contact_requests
ALTER TABLE public.expert_contact_requests
  ADD COLUMN IF NOT EXISTS scenario_code text,
  ADD COLUMN IF NOT EXISTS scenario_id uuid,
  ADD COLUMN IF NOT EXISTS scenario_snapshot jsonb;

-- Allow anonymous inserts to also write the snapshot fields
DROP POLICY IF EXISTS "Anyone can submit an expert contact request" ON public.expert_contact_requests;
CREATE POLICY "Anyone can submit an expert contact request"
  ON public.expert_contact_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(email) <= 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(phone) >= 7
    AND length(phone) <= 32
    AND (scenario_code IS NULL OR (length(scenario_code) <= 64 AND scenario_code ~ '^[A-Z0-9\-]+$'))
  );
