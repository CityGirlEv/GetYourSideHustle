-- Rebrand stored email templates: Get Part B Optimizer → Part B Optimizer

CREATE OR REPLACE FUNCTION public.replace_email_brand_names(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(
        replace(coalesce(input, ''), 'Get Part B Optimizer', 'Part B Optimizer'),
        'The Get Part B Optimizer',
        'Part B Optimizer'
      ),
      'GET PART B OPTIMIZER',
      'PART B OPTIMIZER'
    ),
    'Get Get Part B Optimizer',
    'Part B Optimizer'
  );
$$;

UPDATE public.email_template_overrides
SET
  subject = public.replace_email_brand_names(subject),
  html = public.replace_email_brand_names(html),
  updated_at = now()
WHERE subject ILIKE '%get part b optimizer%'
   OR html ILIKE '%get part b optimizer%';

UPDATE public.email_template_versions
SET
  subject = public.replace_email_brand_names(subject),
  html = public.replace_email_brand_names(html)
WHERE subject ILIKE '%get part b optimizer%'
   OR html ILIKE '%get part b optimizer%';

UPDATE public.learning_articles
SET
  title = public.replace_email_brand_names(title),
  meta_description = public.replace_email_brand_names(meta_description),
  excerpt = public.replace_email_brand_names(excerpt),
  body_md = public.replace_email_brand_names(body_md),
  updated_at = now()
WHERE title ILIKE '%get part b optimizer%'
   OR meta_description ILIKE '%get part b optimizer%'
   OR excerpt ILIKE '%get part b optimizer%'
   OR body_md ILIKE '%get part b optimizer%';

UPDATE public.learning_article_versions
SET
  title = public.replace_email_brand_names(title),
  meta_description = public.replace_email_brand_names(meta_description),
  excerpt = public.replace_email_brand_names(excerpt),
  body_md = public.replace_email_brand_names(body_md)
WHERE title ILIKE '%get part b optimizer%'
   OR meta_description ILIKE '%get part b optimizer%'
   OR excerpt ILIKE '%get part b optimizer%'
   OR body_md ILIKE '%get part b optimizer%';

DROP FUNCTION public.replace_email_brand_names(text);
