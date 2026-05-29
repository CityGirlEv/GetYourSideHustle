DO $$
DECLARE
  v_dup uuid := 'faf4f62d-5750-42bc-a383-2d2cf36c5c46';
BEGIN
  DELETE FROM public.nda_signatures WHERE user_id = v_dup;
  DELETE FROM public.user_roles WHERE user_id = v_dup;
  DELETE FROM public.advisor_credits WHERE advisor_id = v_dup;
  DELETE FROM public.credit_txns WHERE advisor_id = v_dup;
  DELETE FROM public.profiles WHERE id = v_dup;
  DELETE FROM auth.users WHERE id = v_dup;
END $$;