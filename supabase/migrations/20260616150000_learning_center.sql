-- Learning Center: educational articles (public read when published; admin CRUD)

CREATE TABLE public.learning_articles (
  slug text PRIMARY KEY,
  title text NOT NULL,
  meta_description text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body_md text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_articles_status ON public.learning_articles (status);
CREATE INDEX idx_learning_articles_category ON public.learning_articles (category);
CREATE INDEX idx_learning_articles_featured ON public.learning_articles (is_featured)
  WHERE status = 'published';

CREATE TABLE public.learning_article_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL REFERENCES public.learning_articles (slug) ON DELETE CASCADE,
  title text NOT NULL,
  meta_description text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body_md text NOT NULL,
  category text NOT NULL,
  status text NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'override',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_learning_article_versions_slug ON public.learning_article_versions (slug, created_at DESC);

GRANT SELECT ON public.learning_articles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_articles TO service_role;
GRANT SELECT ON public.learning_article_versions TO authenticated;
GRANT ALL ON public.learning_article_versions TO service_role;

ALTER TABLE public.learning_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_article_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published learning articles"
  ON public.learning_articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "admins read all learning articles"
  ON public.learning_articles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert learning articles"
  ON public.learning_articles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update learning articles"
  ON public.learning_articles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete learning articles"
  ON public.learning_articles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins read learning article versions"
  ON public.learning_article_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert learning article versions"
  ON public.learning_article_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed TPMO-compliant educational articles
INSERT INTO public.learning_articles (
  slug, title, meta_description, excerpt, body_md, category, status, is_featured, sort_order, published_at
) VALUES
(
  'original-medicare-vs-medicare-advantage',
  'Original Medicare vs. Medicare Advantage: What Is the Difference?',
  'Educational overview of Original Medicare (Parts A and B) compared with Medicare Advantage (Part C), including how coverage is structured.',
  'Learn how fee-for-service Original Medicare differs from bundled Medicare Advantage plans — without enrollment pressure.',
  E'## Two different ways to receive Medicare benefits\n\n**Original Medicare** is the federal fee-for-service program (Part A hospital and Part B medical). Many people add a separate Part D drug plan and optional Medigap supplemental coverage.\n\n**Medicare Advantage (Part C)** is an alternative way to receive Medicare benefits through private plans approved by Medicare. These plans must cover at least what Original Medicare covers, but cost-sharing, networks, and drug coverage rules can differ.\n\n## Questions to compare on your own\n\n- Do you prefer predictable monthly premiums with Medigap, or a bundled MA plan with network rules?\n- Are your preferred doctors and hospitals in-network for plans available in your area?\n- How do your regular prescriptions appear on each plan''s formulary?\n\n## Important reminder\n\nThis article is for educational comparison only. It is not a complete listing of plans in your area. Verify details with Medicare.gov, 1-800-MEDICARE, or a licensed professional before enrolling.',
  'plan-types',
  'published',
  true,
  10,
  now()
),
(
  'understanding-medicare-part-b-premiums',
  'Understanding Medicare Part B Premiums and IRMAA',
  'Plain-language explanation of Medicare Part B premiums, the standard amount, and Income-Related Monthly Adjustment Amounts (IRMAA).',
  'How Part B premiums work, what IRMAA means, and where to verify official amounts.',
  E'## What Part B covers\n\nMedicare Part B helps cover outpatient care, physician services, preventive care, and durable medical equipment under Original Medicare.\n\n## Standard premium vs. IRMAA\n\nMost people pay the **standard Part B premium** set by CMS each year. Higher-income beneficiaries may pay an additional **Income-Related Monthly Adjustment Amount (IRMAA)** based on tax return information Social Security receives from the IRS.\n\n## Where to verify amounts\n\nOfficial premium tables are published by CMS and Medicare.gov. Amounts change annually, so always confirm the current year''s figures from a government source.\n\n## Educational use only\n\nGet Part B Optimizer helps you model sample scenarios for learning — we do not enroll you in coverage or collect Social Security numbers in our public scenario tool.',
  'costs',
  'published',
  true,
  20,
  now()
),
(
  'medicare-enrollment-periods-overview',
  'Medicare Enrollment Periods: A Calm Overview',
  'Educational summary of Initial Enrollment, General Enrollment, and Special Enrollment Periods for Medicare Part B.',
  'A non-sales overview of common Medicare enrollment windows and why timing matters.',
  E'## Why timing matters\n\nSigning up for Medicare at the wrong time can lead to **late enrollment penalties** for Part B and Part D in some situations. Understanding the basic windows helps you plan conversations with SSA or a licensed advisor.\n\n## Common periods (high level)\n\n- **Initial Enrollment Period (IEP):** Usually the seven-month window around your 65th birthday month.\n- **General Enrollment Period (GEP):** For people who missed IEP; coverage may start later and penalties may apply.\n- **Special Enrollment Periods (SEPs):** May apply when you have qualifying coverage or life events.\n\n## Next step for your situation\n\nUse our de-identified scenario tool to compare sample plan structures, then confirm deadlines that apply to you through Medicare.gov or SSA.',
  'enrollment',
  'published',
  false,
  30,
  now()
),
(
  'how-to-compare-medicare-plans-educationally',
  'How to Compare Medicare Plans Without the Sales Pressure',
  'Practical steps for comparing Medicare plan types using de-identified scenarios and official CMS resources.',
  'Use side-by-side educational comparisons and official sources before making coverage decisions.',
  E'## Start with your facts — not your identity\n\nList your medications, preferred providers, and budget preferences without sharing Social Security numbers or Medicare IDs in online tools that do not need them.\n\n## Compare structure, not slogans\n\nLook at premiums, deductibles, out-of-pocket maximums, network rules, and drug formulary tiers side by side.\n\n## Use official backups\n\nMedicare.gov Plan Finder and 1-800-MEDICARE remain the authoritative sources for what is available where you live.\n\n## Try a sample scenario\n\nBuild a de-identified scenario on Get Part B Optimizer to see how Original Medicare + Medigap vs. Medicare Advantage might look for a sample profile — then validate with a licensed professional if you want personalized guidance.',
  'comparing-plans',
  'published',
  false,
  40,
  now()
);
