-- Backfill email confirmation for admins and Lyriq so they appear in the QA roster.
UPDATE auth.users u
SET email_confirmed_at = COALESCE(u.email_confirmed_at, now())
WHERE u.id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
   OR u.id IN (
     SELECT p.id
     FROM public.profiles p
     WHERE split_part(trim(p.full_name), ' ', 1) ILIKE 'Lyriq'
        OR trim(p.full_name) ILIKE 'Lyriq%'
   );
