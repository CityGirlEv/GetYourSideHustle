-- Assign client role to roster users (Daisy, Don, James, Karen, Vickey, Wilbur).
-- Replaces existing roles so pickRole returns client.

DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT p.id
  FROM public.profiles p
  WHERE split_part(trim(p.full_name), ' ', 1) ILIKE ANY (
    ARRAY['Daisy', 'Don', 'James', 'Karen', 'Vickey', 'Wilbur']
  )
);

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'client'::app_role
FROM public.profiles p
WHERE split_part(trim(p.full_name), ' ', 1) ILIKE ANY (
  ARRAY['Daisy', 'Don', 'James', 'Karen', 'Vickey', 'Wilbur']
)
ON CONFLICT (user_id, role) DO NOTHING;
