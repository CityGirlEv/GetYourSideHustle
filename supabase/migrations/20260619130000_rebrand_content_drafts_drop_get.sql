-- Remove legacy “Get Part B …” from Content Factory drafts (calendar / schedule copy).

CREATE OR REPLACE FUNCTION public.replace_email_brand_names(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(
        replace(
          replace(
            replace(coalesce(input, ''), 'Get Get Part B Optimizer', 'Part B Optimizer'),
            'GET PART B OPTIMIZER',
            'PART B OPTIMIZER'
          ),
          'The Get Part B Optimizer',
          'The Part B Optimizer'
        ),
        'Get Part B Optimizer',
        'Part B Optimizer'
      ),
      'Get Part B',
      'Part B'
    ),
    'get part b optimizer',
    'part b optimizer'
  );
$$;

UPDATE public.content_drafts
SET
  title = public.replace_email_brand_names(title),
  excerpt = public.replace_email_brand_names(excerpt),
  body = public.replace_email_brand_names(body),
  updated_at = now()
WHERE title ILIKE '%get part b%'
   OR excerpt ILIKE '%get part b%'
   OR body ILIKE '%get part b%';

UPDATE public.content_drafts
SET
  payload = replace(
    replace(
      replace(payload::text, 'Get Part B Optimizer', 'Part B Optimizer'),
      'The Get Part B Optimizer',
      'The Part B Optimizer'
    ),
    'get part b optimizer',
    'part b optimizer'
  )::jsonb,
  updated_at = now()
WHERE payload::text ILIKE '%get part b%';

UPDATE public.content_draft_versions
SET snapshot = replace(
  replace(
    replace(snapshot::text, 'Get Part B Optimizer', 'Part B Optimizer'),
    'The Get Part B Optimizer',
    'The Part B Optimizer'
  ),
  'get part b optimizer',
  'part b optimizer'
)::jsonb
WHERE snapshot::text ILIKE '%get part b%';

DROP FUNCTION public.replace_email_brand_names(text);
