-- Track whether the user has set / confirmed a login password (registration or reset).
alter table public.profiles
  add column if not exists password_confirmed_at timestamptz;

comment on column public.profiles.password_confirmed_at is
  'Set when the user chooses a password at registration or completes a password reset.';
