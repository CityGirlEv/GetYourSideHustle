
CREATE TABLE public.expert_contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expert_contact_requests ENABLE ROW LEVEL SECURITY;

-- Anyone may submit an opt-in request
CREATE POLICY "Anyone can submit an expert contact request"
ON public.expert_contact_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(phone) BETWEEN 7 AND 32
);

-- Only admins can read
CREATE POLICY "Admins can view expert contact requests"
ON public.expert_contact_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
