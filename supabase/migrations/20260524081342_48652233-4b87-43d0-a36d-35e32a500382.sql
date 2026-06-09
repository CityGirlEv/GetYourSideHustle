
-- 1. Audit logs: remove client insert policy, add SECURITY DEFINER RPC
DROP POLICY IF EXISTS "own audit insert" ON public.audit_logs;

CREATE OR REPLACE FUNCTION public.log_audit_event(p_action text, p_metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_action IS NULL OR length(p_action) = 0 OR length(p_action) > 64 OR p_action !~ '^[A-Z0-9_]+$' THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;
  INSERT INTO public.audit_logs(user_id, action, metadata)
  VALUES (v_uid, p_action, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, jsonb) TO authenticated;

-- 2. Credit transactions and balance: remove client write policies
DROP POLICY IF EXISTS "own txn insert" ON public.credit_txns;
DROP POLICY IF EXISTS "own credits upsert" ON public.advisor_credits;

-- Re-add an explicit read-only policy for advisor_credits (the prior ALL policy covered SELECT too)
DROP POLICY IF EXISTS "own credits read" ON public.advisor_credits;
CREATE POLICY "own credits read"
  ON public.advisor_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = advisor_id);

-- 3. Server-side credit functions
CREATE OR REPLACE FUNCTION public.deduct_credit(p_description text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_description IS NULL OR length(p_description) = 0 OR length(p_description) > 200 THEN
    RAISE EXCEPTION 'Invalid description';
  END IF;

  INSERT INTO public.advisor_credits(advisor_id, balance)
  VALUES (v_uid, 0)
  ON CONFLICT (advisor_id) DO NOTHING;

  UPDATE public.advisor_credits
    SET balance = balance - 1, updated_at = now()
    WHERE advisor_id = v_uid AND balance > 0
    RETURNING balance INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  INSERT INTO public.credit_txns(advisor_id, amount, description)
  VALUES (v_uid, -1, p_description);

  RETURN v_balance;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.deduct_credit(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.deduct_credit(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.purchase_credits(p_amount integer, p_description text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 500 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  IF p_description IS NULL OR length(p_description) = 0 OR length(p_description) > 200 THEN
    RAISE EXCEPTION 'Invalid description';
  END IF;

  INSERT INTO public.advisor_credits(advisor_id, balance)
  VALUES (v_uid, p_amount)
  ON CONFLICT (advisor_id) DO UPDATE
    SET balance = public.advisor_credits.balance + EXCLUDED.balance,
        updated_at = now()
  RETURNING balance INTO v_balance;

  INSERT INTO public.credit_txns(advisor_id, amount, description)
  VALUES (v_uid, p_amount, p_description);

  RETURN v_balance;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purchase_credits(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_credits(integer, text) TO authenticated;

-- Admin-only adjustment (replaces previous client-side admin top-up / deduction)
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(p_target uuid, p_amount integer, p_description text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 OR p_amount < -500 OR p_amount > 500 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  IF p_description IS NULL OR length(p_description) = 0 OR length(p_description) > 200 THEN
    RAISE EXCEPTION 'Invalid description';
  END IF;

  INSERT INTO public.advisor_credits(advisor_id, balance)
  VALUES (p_target, GREATEST(p_amount, 0))
  ON CONFLICT (advisor_id) DO UPDATE
    SET balance = GREATEST(public.advisor_credits.balance + EXCLUDED.balance, 0),
        updated_at = now()
  RETURNING balance INTO v_balance;

  INSERT INTO public.credit_txns(advisor_id, amount, description)
  VALUES (p_target, p_amount, p_description);

  RETURN v_balance;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text) TO authenticated;

-- 4. Scenarios: add a SELECT policy so claimed scenarios are readable (defense in depth alongside my_scenarios RPC)
CREATE POLICY "advisors read own claimed scenarios"
  ON public.scenarios FOR SELECT
  TO authenticated
  USING (claimed_by = auth.uid());

-- Make sure advisor_credits has a unique constraint on advisor_id for ON CONFLICT (defensive — column is already PK-like by usage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'advisor_credits_advisor_id_key'
  ) THEN
    BEGIN
      ALTER TABLE public.advisor_credits ADD CONSTRAINT advisor_credits_advisor_id_key UNIQUE (advisor_id);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END;
  END IF;
END $$;
