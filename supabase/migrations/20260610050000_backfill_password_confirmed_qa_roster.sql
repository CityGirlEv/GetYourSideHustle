-- Backfill password confirmation for admins and Lyriq so they appear in the QA roster.
UPDATE public.profiles p
SET password_confirmed_at = COALESCE(p.password_confirmed_at, now())
WHERE p.id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
   OR split_part(trim(p.full_name), ' ', 1) ILIKE 'Lyriq'
   OR trim(p.full_name) ILIKE 'Lyriq%';
