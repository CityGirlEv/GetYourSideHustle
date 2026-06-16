-- Only admins, Lyric/Lyriq, and Maria remain email-confirmed; clear everyone else.
UPDATE auth.users u
SET email_confirmed_at = NULL
WHERE u.email_confirmed_at IS NOT NULL
  AND u.id NOT IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
    UNION
    SELECT p.id
    FROM public.profiles p
    WHERE split_part(trim(p.full_name), ' ', 1) ILIKE ANY (ARRAY['Lyriq', 'Lyric', 'Maria'])
       OR trim(p.full_name) ILIKE ANY (ARRAY['Lyriq%', 'Lyric%', 'Maria%'])
  );

-- Admin/service-role helper: set or clear email_confirmed_at (returns the timestamp).
CREATE OR REPLACE FUNCTION public.admin_set_email_confirmed(
  p_user_id uuid,
  p_confirmed boolean
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_at timestamptz;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id required';
  END IF;

  IF p_confirmed THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = p_user_id
    RETURNING email_confirmed_at INTO v_at;
  ELSE
    UPDATE auth.users
    SET email_confirmed_at = NULL
    WHERE id = p_user_id;
    v_at := NULL;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN v_at;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_email_confirmed(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_email_confirmed(uuid, boolean) TO service_role;
