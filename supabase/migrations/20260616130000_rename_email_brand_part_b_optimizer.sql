-- Backfill admin-saved email template overrides/versions after app rename:
-- The Medicare Optimizer / Get Part B Optimizer → Part B Optimizer

CREATE OR REPLACE FUNCTION public.replace_email_brand_names(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(
        replace(coalesce(input, ''), 'The Medicare Optimizer', 'Part B Optimizer'),
        'Get Part B Optimizer',
        'Part B Optimizer'
      ),
      'themedicareoptimizer',
      'Part B Optimizer'
    ),
    'The Get Part B Optimizer',
    'Part B Optimizer'
  );
$$;

UPDATE public.email_template_overrides
SET
  subject = public.replace_email_brand_names(subject),
  html = public.replace_email_brand_names(html),
  updated_at = now()
WHERE subject ILIKE '%medicare optimizer%'
   OR subject ILIKE '%get part b optimizer%'
   OR html ILIKE '%medicare optimizer%'
   OR html ILIKE '%get part b optimizer%'
   OR html ILIKE '%themedicareoptimizer%';

UPDATE public.email_template_versions
SET
  subject = public.replace_email_brand_names(subject),
  html = public.replace_email_brand_names(html)
WHERE subject ILIKE '%medicare optimizer%'
   OR subject ILIKE '%get part b optimizer%'
   OR html ILIKE '%medicare optimizer%'
   OR html ILIKE '%get part b optimizer%'
   OR html ILIKE '%themedicareoptimizer%';

DROP FUNCTION public.replace_email_brand_names(text);
