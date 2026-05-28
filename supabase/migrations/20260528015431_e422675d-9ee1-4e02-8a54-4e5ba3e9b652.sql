REVOKE EXECUTE ON FUNCTION public.purchase_credits(integer, text) FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.purchase_credits(integer, text) TO service_role;