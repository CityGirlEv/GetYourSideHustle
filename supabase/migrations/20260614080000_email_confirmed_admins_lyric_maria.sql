-- Email confirmed ON only for admins, Lyric/Lyriq, and Maria; everyone else OFF.
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

-- Keep allowlisted users confirmed (preserve existing confirmation timestamps).
UPDATE auth.users u
SET email_confirmed_at = COALESCE(u.email_confirmed_at, now())
WHERE u.id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
  UNION
  SELECT p.id
  FROM public.profiles p
  WHERE split_part(trim(p.full_name), ' ', 1) ILIKE ANY (ARRAY['Lyriq', 'Lyric', 'Maria'])
     OR trim(p.full_name) ILIKE ANY (ARRAY['Lyriq%', 'Lyric%', 'Maria%'])
);
