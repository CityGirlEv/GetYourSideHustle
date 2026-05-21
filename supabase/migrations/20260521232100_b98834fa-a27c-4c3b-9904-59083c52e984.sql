
-- Roles enum + table (separate from profiles to prevent privilege escalation)
CREATE TYPE public.app_role AS ENUM ('client', 'advisor', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  npn_number text,
  hipaa_acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Per-user PBKDF2 salt + verifier ciphertext. The passphrase is NEVER sent.
CREATE TABLE public.encryption_keys (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  salt text NOT NULL,             -- base64 PBKDF2 salt
  iterations integer NOT NULL DEFAULT 600000,
  verifier_iv text NOT NULL,      -- base64 IV used to encrypt the verifier
  verifier_ciphertext text NOT NULL, -- AES-GCM ciphertext of a known plaintext
  created_at timestamptz NOT NULL DEFAULT now()
);

-- All PHI lives inside the ciphertext column. Server never sees plaintext.
CREATE TABLE public.clients_encrypted (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  iv text NOT NULL,
  ciphertext text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clients_encrypted_advisor_idx ON public.clients_encrypted(advisor_id);

CREATE TABLE public.soas_encrypted (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients_encrypted(id) ON DELETE CASCADE,
  iv text NOT NULL,
  ciphertext text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  signed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX soas_encrypted_advisor_idx ON public.soas_encrypted(advisor_id);

-- Append-only audit trail. NO PHI in plaintext; only action codes and entity ids.
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_user_idx ON public.audit_logs(user_id, created_at DESC);

CREATE TABLE public.advisor_credits (
  advisor_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.credit_txns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_txns_advisor_idx ON public.credit_txns(advisor_id, created_at DESC);

-- Security-definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + default 'advisor' role on signup, plus 10 free credits.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'advisor');

  INSERT INTO public.advisor_credits (advisor_id, balance)
  VALUES (NEW.id, 10);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER clients_encrypted_touch BEFORE UPDATE ON public.clients_encrypted
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============= RLS =============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients_encrypted ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soas_encrypted ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_txns ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles: only admins can modify; users can read their own
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- encryption_keys: strictly own row
CREATE POLICY "own key read" ON public.encryption_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own key insert" ON public.encryption_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own key update" ON public.encryption_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- clients_encrypted: only owning advisor
CREATE POLICY "own clients all" ON public.clients_encrypted FOR ALL TO authenticated
  USING (auth.uid() = advisor_id) WITH CHECK (auth.uid() = advisor_id);

-- soas
CREATE POLICY "own soas all" ON public.soas_encrypted FOR ALL TO authenticated
  USING (auth.uid() = advisor_id) WITH CHECK (auth.uid() = advisor_id);

-- audit_logs: insert-only for self, read own, admins read all. NO update/delete.
CREATE POLICY "own audit insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own audit read" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin audit read" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- credits
CREATE POLICY "own credits read" ON public.advisor_credits FOR SELECT TO authenticated USING (auth.uid() = advisor_id);
CREATE POLICY "own credits upsert" ON public.advisor_credits FOR ALL TO authenticated
  USING (auth.uid() = advisor_id) WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "own txn read" ON public.credit_txns FOR SELECT TO authenticated USING (auth.uid() = advisor_id);
CREATE POLICY "own txn insert" ON public.credit_txns FOR INSERT TO authenticated WITH CHECK (auth.uid() = advisor_id);
