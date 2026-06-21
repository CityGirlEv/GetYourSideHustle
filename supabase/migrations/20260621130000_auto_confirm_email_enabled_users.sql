-- Auto-confirm email for enabled accounts so login works after admin approval
-- without a separate email confirmation step.

UPDATE auth.users u
SET email_confirmed_at = COALESCE(u.email_confirmed_at, now())
WHERE u.email_confirmed_at IS NULL
  AND (u.banned_until IS NULL OR u.banned_until <= now());
