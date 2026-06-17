-- Backfill admin-saved email template overrides/versions after app rename:
-- Part B Optimizer → Get Part B Optimizer

CREATE OR REPLACE FUNCTION public.replace_email_brand_names(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(coalesce(input, ''), 'The Part B Optimizer', 'Get Part B Optimizer'),
      'Part B Optimizer',
      'Get Part B Optimizer'
    ),
    'Get Get Part B Optimizer',
    'Get Part B Optimizer'
  );
$$;

UPDATE public.email_template_overrides
SET
  subject = public.replace_email_brand_names(subject),
  html = public.replace_email_brand_names(html),
  updated_at = now()
WHERE subject ILIKE '%part b optimizer%'
   OR html ILIKE '%part b optimizer%';

UPDATE public.email_template_versions
SET
  subject = public.replace_email_brand_names(subject),
  html = public.replace_email_brand_names(html)
WHERE subject ILIKE '%part b optimizer%'
   OR html ILIKE '%part b optimizer%';

DROP FUNCTION public.replace_email_brand_names(text);
