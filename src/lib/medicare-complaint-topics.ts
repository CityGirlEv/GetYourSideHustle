import type { ArticleDraft } from "@/lib/article-authoring";
import { featuredImagePublicPath } from "@/lib/article-authoring";
import type { ArticleCategory } from "@/lib/learning-center";

export interface ArticleTopicSummary {
  id: string;
  title: string;
  pitch: string;
}

export interface MedicareComplaintCluster {
  rank: number;
  id: string;
  complaint: string;
  whyItMatters: string;
  signal: string;
  topics: ArticleTopicSummary[];
}

export interface MedicareComplaintResearch {
  researchedAt: string;
  sourceNote: string;
  complaints: MedicareComplaintCluster[];
}

interface TopicTemplate {
  title: string;
  slug: string;
  excerpt: string;
  metaDescription: string;
  category: ArticleCategory;
  featured?: boolean;
  bodyMd: string;
}

function body(
  sections: Array<{ heading: string; paragraphs?: string[]; bullets?: string[] }>,
  closing: string,
  faq?: Array<{ q: string; a: string }>,
): string {
  const parts: string[] = [];
  for (const s of sections) {
    parts.push(`## ${s.heading}`, "");
    for (const p of s.paragraphs ?? []) parts.push(p, "");
    if (s.bullets?.length) {
      parts.push(...s.bullets.map((b) => `- ${b}`), "");
    }
  }
  parts.push(closing, "");
  const faqItems = faq ?? [...STANDARD_TOPIC_FAQ];
  if (faqItems.length) {
    parts.push("## Frequently asked questions", "");
    for (const item of faqItems) {
      parts.push(`### ${item.q}`, "", item.a, "");
    }
  }
  return parts.join("\n").trim();
}

const STANDARD_TOPIC_FAQ = [
  {
    q: "Is this article enrollment advice?",
    a: "No. Learning Center articles are educational only. They do not recommend specific plans, carriers, or enrollment actions.",
  },
  {
    q: "Where should I verify official Medicare rules?",
    a: "Use Medicare.gov, 1-800-MEDICARE, or your State Health Insurance Assistance Program (SHIP) for rules that apply to you.",
  },
] as const;

const TOPIC_TEMPLATES: Record<string, TopicTemplate> = {
  "prior-auth-overview": {
    title: "What Is Medicare Prior Authorization? A Plain-Language Overview",
    slug: "what-is-medicare-prior-authorization",
    excerpt:
      "Why some Medicare plans require approval before care — and what to verify before you assume a service is covered.",
    metaDescription:
      "Educational overview of prior authorization in Medicare Advantage, what it means for access to care, and how to verify plan rules.",
    category: "comparing-plans",
    bodyMd: body(
      [
        {
          heading: "What prior authorization means",
          paragraphs: [
            "Some Medicare plans require the plan to approve certain services before they pay. That step is often called prior authorization or pre-approval.",
            "It is not unique to one carrier — it appears in many Medicare Advantage plans and is a frequent source of confusion in public complaints.",
          ],
        },
        {
          heading: "Questions to ask before care",
          bullets: [
            "Is this service on the plan's prior authorization list?",
            "Who submits the request — your provider or the facility?",
            "What happens if you are mid-treatment and authorization expires?",
          ],
        },
      ],
      "This article is educational only. Verify current plan documents and Medicare.gov for rules that apply to you.",
    ),
  },
  "prior-auth-appeals": {
    title: "If a Medicare Plan Denies Care: Understanding Appeals at a High Level",
    slug: "medicare-plan-denial-appeals-overview",
    excerpt:
      "A calm overview of appeal rights when a plan denies a service — not legal advice, but a starting map.",
    metaDescription:
      "Educational summary of Medicare Advantage and Part D appeal concepts when care is denied, with pointers to official Medicare resources.",
    category: "staying-informed",
    bodyMd: body(
      [
        {
          heading: "Denials are not always final",
          paragraphs: [
            "Beneficiaries and providers can often challenge a denial through the plan's appeal process. Federal oversight reports have noted that many appealed denials are overturned.",
            "That does not mean every denial is wrong — but it does mean appeals are a formal path worth understanding before you give up on a service.",
          ],
        },
        {
          heading: "Where to start",
          bullets: [
            "Read the denial notice for deadlines and next steps.",
            "Ask your provider whether they will help with the appeal.",
            "Use Medicare.gov or 1-800-MEDICARE for official appeal guidance.",
          ],
        },
      ],
      "Educational content only — not legal or medical advice.",
    ),
  },
  "zero-premium-explained": {
    title: 'Medicare Advantage $0 Premiums: What "Free" Does and Does Not Mean',
    slug: "medicare-advantage-zero-premium-explained",
    excerpt:
      "Zero monthly premium does not mean zero cost — here is what to compare in the fine print.",
    metaDescription:
      "Educational explanation of $0-premium Medicare Advantage plans, cost-sharing, networks, and comparison questions without sales pressure.",
    category: "plan-types",
    featured: true,
    bodyMd: body(
      [
        {
          heading: "Premium vs. total cost",
          paragraphs: [
            "Many Medicare Advantage plans advertise a $0 monthly premium. That can be accurate for the plan premium itself while copays, deductibles, and out-of-pocket maximums still apply.",
            "Forum and news reports often describe beneficiaries who focused on the premium and were surprised by bills for out-of-network or non-covered care.",
          ],
        },
        {
          heading: "Compare more than the headline",
          bullets: [
            "Out-of-pocket maximum for the year",
            "Network rules for your doctors and hospitals",
            "Drug formulary tiers if Part D is included",
          ],
        },
      ],
      "We do not recommend specific plans. Use official Medicare resources to compare options in your area.",
    ),
  },
  "tv-ad-perks": {
    title: "Reading Medicare TV Ads: Benefits to Compare Beyond the Headline",
    slug: "reading-medicare-tv-ads-educationally",
    excerpt:
      "Dental, vision, and gym perks get airtime — medical access and cost-sharing deserve equal weight.",
    metaDescription:
      "Educational tips for comparing Medicare TV marketing with plan documents, provider networks, and official CMS resources.",
    category: "staying-informed",
    bodyMd: body(
      [
        {
          heading: "Why ads feel confusing",
          paragraphs: [
            "Medicare marketing often highlights extras that are easy to understand — dental allowances, vision benefits, fitness programs.",
            "Complaints in public forums frequently mention that medical access, prior authorization, and network rules were harder to find in the full plan materials.",
          ],
        },
        {
          heading: "A simple comparison habit",
          bullets: [
            "Write down the medical services you use most before you watch ads.",
            "Match ad claims to the plan's Evidence of Coverage document.",
            "Confirm providers on Medicare.gov Plan Finder or with the plan directly.",
          ],
        },
      ],
      "Educational only — not a complete listing of plans in your area.",
    ),
  },
  "medigap-window": {
    title: "The Medigap Open Enrollment Window: Why Timing Matters",
    slug: "medigap-open-enrollment-window-explained",
    excerpt:
      "A calm overview of the six-month Medigap window when guaranteed-issue rules work differently.",
    metaDescription:
      "Educational summary of the Medigap open enrollment period, guaranteed issue rights, and why switching later can involve medical underwriting.",
    category: "enrollment",
    featured: true,
    bodyMd: body(
      [
        {
          heading: "The six-month window",
          paragraphs: [
            "When you first enroll in Medicare Part B, you generally have a six-month Medigap open enrollment period. During that time, insurers in most states must sell you a Medigap policy without health questions.",
            "Missing that window is one of the most common regrets described in beneficiary forums when someone later wants to leave Medicare Advantage.",
          ],
        },
        {
          heading: "After the window",
          paragraphs: [
            "Outside guaranteed-issue protections, insurers may use medical underwriting. Pre-existing conditions can affect price or eligibility.",
          ],
          bullets: [
            "Some states offer additional Medigap protections — rules vary.",
            "Verify your state's rules with SHIP or Medicare.gov.",
          ],
        },
      ],
      "Educational content only — verify rules for your state and situation.",
    ),
  },
  "advantage-to-medigap": {
    title: "Switching From Medicare Advantage to Medigap: What People Wish They Knew Earlier",
    slug: "switching-from-advantage-to-medigap",
    excerpt:
      "Why moving back to Original Medicare plus Medigap is not always as simple as switching Advantage plans.",
    metaDescription:
      "Educational overview of challenges beneficiaries report when leaving Medicare Advantage for Medigap, including underwriting and timing.",
    category: "enrollment",
    bodyMd: body(
      [
        {
          heading: "Two different paths",
          paragraphs: [
            "Switching from one Medicare Advantage plan to another during annual enrollment is a familiar process for many people.",
            "Moving from Medicare Advantage back to Original Medicare with a new Medigap policy can involve different rules — especially if your Medigap open enrollment window has passed.",
          ],
        },
        {
          heading: "Plan before you switch",
          bullets: [
            "Confirm Part D coverage if you leave an MA plan that included drugs.",
            "Research Medigap underwriting rules in your state.",
            "Talk to SSA and a licensed professional if you want personalized guidance.",
          ],
        },
      ],
      "Not personalized advice — educational comparison only.",
    ),
  },
  "network-changes": {
    title: "Medicare Advantage Networks: When Your Doctor Is No Longer In Network",
    slug: "medicare-advantage-network-changes",
    excerpt:
      "Network rules affect who you can see — here is how to compare plans with your providers in mind.",
    metaDescription:
      "How provider networks work in Medicare Advantage, why they can change, and educational questions to ask before choosing a plan.",
    category: "comparing-plans",
    bodyMd: body(
      [
        {
          heading: "Networks are plan-specific",
          paragraphs: [
            "Medicare Advantage plans often use provider networks. If your doctor or hospital is out of network, you may pay more or receive no plan payment at all.",
            "Beneficiaries frequently report frustration when a trusted provider leaves the network mid-year or was never in network despite assumptions.",
          ],
        },
        {
          heading: "Protect yourself with verification",
          bullets: [
            "Check each provider on the plan's current directory before enrollment.",
            "Ask if referral rules apply for specialists.",
            "Re-check networks if your plan sends a change notice.",
          ],
        },
      ],
      "Educational only — networks and rules change; verify before care.",
    ),
  },
  "out-of-network-surprises": {
    title: "Out-of-Network Care Under Medicare Advantage: How Surprise Bills Happen",
    slug: "medicare-advantage-out-of-network-surprises",
    excerpt:
      "Why a covered service at one facility can still generate unexpected costs if a provider is out of network.",
    metaDescription:
      "Educational explanation of out-of-network billing under Medicare Advantage and questions to ask hospitals and specialists in advance.",
    category: "costs",
    bodyMd: body(
      [
        {
          heading: "Facility vs. provider billing",
          paragraphs: [
            "A hospital may be in network while an anesthesiologist or radiologist who treats you is not. That split billing pattern appears often in beneficiary complaint stories.",
          ],
        },
        {
          heading: "Before scheduled care",
          bullets: [
            "Ask whether every professional involved accepts your plan.",
            "Request written network confirmation when possible.",
            "Know your plan's out-of-network cost-sharing rules.",
          ],
        },
      ],
      "Not a quote of benefits — verify with your plan documents.",
    ),
  },
  "working-past-65": {
    title: "Do You Need Medicare at 65 If You Are Still Working?",
    slug: "medicare-at-65-while-still-working",
    excerpt:
      "Employer coverage can delay Part B — but the rules depend on employer size and your situation.",
    metaDescription:
      "Educational guide to Medicare enrollment when you have employer coverage past age 65 and how Special Enrollment Periods may apply.",
    category: "enrollment",
    bodyMd: body(
      [
        {
          heading: "Employer size matters",
          paragraphs: [
            "If you have health coverage through your or your spouse's active employment, you may be able to delay Part B without a late penalty — but the employer generally must have 20 or more employees for Medicare to be secondary.",
          ],
        },
        {
          heading: "Before you defer Part B",
          bullets: [
            "Confirm with your employer benefits office in writing.",
            "Understand how your drug coverage compares to Part D creditable coverage rules.",
            "Mark your Special Enrollment Period window if you leave employer coverage.",
          ],
        },
      ],
      "Verify with SSA and Medicare.gov — rules are situation-specific.",
    ),
  },
  "part-b-late-penalty": {
    title: "Medicare Part B Late Enrollment Penalties: A Calm Overview",
    slug: "medicare-part-b-late-enrollment-penalty-overview",
    excerpt:
      "Why missing enrollment windows can add a lasting premium surcharge — and where to verify official rules.",
    metaDescription:
      "Educational summary of Medicare Part B late enrollment penalties, common timing mistakes, and official SSA guidance sources.",
    category: "enrollment",
    bodyMd: body(
      [
        {
          heading: "Why penalties exist",
          paragraphs: [
            "Medicare uses late enrollment penalties to encourage timely Part B signup when people do not have other qualifying coverage.",
            "Turning-65 mistake lists in community forums often include waiting too long to enroll while assuming employer rules applied.",
          ],
        },
        {
          heading: "Official verification",
          bullets: [
            "Confirm your personal enrollment window with SSA.",
            "Ask whether your non-Medicare coverage counts as creditable for Part B deferral.",
            "Use Medicare.gov for published penalty calculation examples.",
          ],
        },
      ],
      "Educational only — not tax or legal advice.",
    ),
  },
  "irmaa-shock": {
    title: "Why Your Medicare Part B Premium Might Be Higher Than the Standard Amount",
    slug: "medicare-part-b-premium-higher-than-standard",
    excerpt:
      "Higher-income beneficiaries may pay IRMAA on top of the standard Part B premium — here is how that works at a high level.",
    metaDescription:
      "Plain-language explanation of Medicare IRMAA, the standard Part B premium, and where to verify official CMS amounts.",
    category: "costs",
    bodyMd: body(
      [
        {
          heading: "Standard vs. income-related amounts",
          paragraphs: [
            "Most people pay the standard Part B premium set by CMS each year. Beneficiaries with higher modified adjusted gross income may pay an Income-Related Monthly Adjustment Amount (IRMAA).",
            "Social Security adjusts the amount withheld from benefits based on tax return data from two years prior.",
          ],
        },
        {
          heading: "If your income changed",
          paragraphs: [
            "Life events can affect IRMAA. SSA has forms to request a new determination when income drops due to specific qualifying events.",
          ],
          bullets: ["Verify amounts on Medicare.gov each fall.", "Contact SSA if you believe IRMAA is incorrect."],
        },
      ],
      "Amounts change annually — always confirm current year figures on Medicare.gov.",
    ),
  },
  "plan-booklet-overload": {
    title: "Making Sense of Medicare Plan Documents Without the Overwhelm",
    slug: "medicare-plan-documents-without-overwhelm",
    excerpt:
      "Long Evidence of Coverage booklets are normal — here is a simple order to read them.",
    metaDescription:
      "Educational tips for reading Medicare Advantage and Part D plan documents, focusing on networks, cost-sharing, and drug formularies.",
    category: "staying-informed",
    bodyMd: body(
      [
        {
          heading: "You are not alone",
          paragraphs: [
            "Beneficiaries with advanced degrees describe feeling lost in 200-page plan booklets. The length is a common complaint — not a personal failing.",
          ],
        },
        {
          heading: "Read in this order",
          bullets: [
            "Summary of Benefits — premiums and max out-of-pocket",
            "Provider directory — your doctors and hospitals",
            "Formulary — your medications",
            "Prior authorization list — if applicable",
          ],
        },
      ],
      "Educational comparison habit — not a substitute for licensed advice.",
    ),
  },
  "annual-review-checklist": {
    title: "An Annual Medicare Review Checklist (Without the Sales Pitch)",
    slug: "annual-medicare-review-checklist",
    excerpt:
      "Plans and formularies change — a yearly review helps you compare before enrollment windows close.",
    metaDescription:
      "A practical educational checklist for reviewing Medicare coverage each fall using official CMS resources and your health needs.",
    category: "staying-informed",
    bodyMd: body(
      [
        {
          heading: "Why review every year",
          paragraphs: [
            "Even if you like your current plan, benefits, networks, and drug tiers can change for the coming contract year.",
          ],
        },
        {
          heading: "Checklist items",
          bullets: [
            "List medications and check formulary changes",
            "Confirm doctors and hospitals remain in network",
            "Compare out-of-pocket maximum and premium changes",
            "Note enrollment deadlines on your calendar",
          ],
        },
      ],
      "Use Medicare.gov Plan Finder for authoritative plan data in your ZIP code.",
    ),
  },
  "switch-to-original": {
    title: "Can You Switch From Medicare Advantage Back to Original Medicare?",
    slug: "switch-from-medicare-advantage-to-original-medicare",
    excerpt:
      "Switching paths exist — but timing and supplemental coverage rules deserve a close read first.",
    metaDescription:
      "Educational overview of enrollment periods for leaving Medicare Advantage and planning for Part D and supplemental coverage.",
    category: "enrollment",
    bodyMd: body(
      [
        {
          heading: "Enrollment periods matter",
          paragraphs: [
            "The Annual Enrollment Period (October 15 – December 7) allows many beneficiaries to leave Medicare Advantage and return to Original Medicare effective January 1.",
            "The Medicare Advantage Open Enrollment Period (January 1 – March 31) offers another limited window for people already in MA plans.",
          ],
        },
        {
          heading: "Plan supplemental coverage",
          bullets: [
            "Enroll in a standalone Part D plan if you need drug coverage.",
            "Research Medigap eligibility before you disenroll from MA.",
            "Contact your MA plan to confirm disenrollment steps.",
          ],
        },
      ],
      "Educational only — verify dates and rules for your contract year.",
    ),
  },
  "part-d-formulary": {
    title: "Medicare Part D Formularies: Why Your Drug May Be on a Different Tier",
    slug: "medicare-part-d-formulary-tiers-explained",
    excerpt:
      "The same medication can cost differently on two plans — formularies are a key comparison point.",
    metaDescription:
      "Educational overview of Part D drug formularies, tiers, and how to verify coverage on Medicare.gov Plan Finder.",
    category: "costs",
    bodyMd: body(
      [
        {
          heading: "Formularies are plan-specific",
          paragraphs: [
            "Each Part D plan maintains its own list of covered drugs and assigns tier levels that affect copays or coinsurance.",
            "Beneficiaries often discover mid-year that a drug moved tiers or requires prior authorization.",
          ],
        },
        {
          heading: "Compare with your bottle in hand",
          bullets: [
            "Enter exact drug name and dosage in Plan Finder",
            "Check pharmacy preference tiers if you use mail order",
            "Review the plan's exceptions and appeals process",
          ],
        },
      ],
      "Not a formulary document — verify coverage with the plan directly.",
    ),
  },
};

const COMPLAINT_CLUSTERS: Array<Omit<MedicareComplaintCluster, "topics"> & { topicIds: string[] }> = [
  {
    rank: 1,
    id: "prior-auth",
    complaint: "Care denied or delayed by prior authorization",
    whyItMatters: "Top theme in OIG reports and MA complaints — many appealed denials are overturned.",
    signal: "HHS OIG 2026, CMS prior auth transparency rules, beneficiary forums",
    topicIds: ["prior-auth-overview", "prior-auth-appeals"],
  },
  {
    rank: 2,
    id: "zero-premium-ads",
    complaint: "$0 premium plans that hide real costs",
    whyItMatters: "TV marketing draws people in; forums describe surprise bills and network limits.",
    signal: "Newsweek MA complaints, Reddit turning-65 mistake threads",
    topicIds: ["zero-premium-explained", "tv-ad-perks"],
  },
  {
    rank: 3,
    id: "medigap-timing",
    complaint: "Missed Medigap window after choosing Advantage",
    whyItMatters: "Guaranteed-issue rights expire; underwriting can block supplemental coverage later.",
    signal: "NCOA Medigap guidance, beneficiary regret stories",
    topicIds: ["medigap-window", "advantage-to-medigap"],
  },
  {
    rank: 4,
    id: "network-traps",
    complaint: "Doctor or hospital not in network",
    whyItMatters: "Network changes mid-year and out-of-network billing drive bill shock.",
    signal: "AARP community forums, provider directory complaints",
    topicIds: ["network-changes", "out-of-network-surprises"],
  },
  {
    rank: 5,
    id: "enrollment-timing",
    complaint: "Enrolled too late or too early around age 65",
    whyItMatters: "Part B penalties and employer-coverage confusion are perennial search topics.",
    signal: "MedicareFAQ top questions, SSA enrollment calls",
    topicIds: ["working-past-65", "part-b-late-penalty"],
  },
  {
    rank: 6,
    id: "premium-shock",
    complaint: "Part B premium higher than expected (IRMAA)",
    whyItMatters: "Social Security withhold surprises are a common costs complaint.",
    signal: "CMS IRMAA tables, Medicare costs FAQ",
    topicIds: ["irmaa-shock", "part-d-formulary"],
  },
  {
    rank: 7,
    id: "plan-doc-overload",
    complaint: "Plan booklets are overwhelming and confusing",
    whyItMatters: "Beneficiaries say marketing is simple but documents feel designed to confuse.",
    signal: "Senate Finance marketing reports, forum posts",
    topicIds: ["plan-booklet-overload", "annual-review-checklist"],
  },
  {
    rank: 8,
    id: "switch-back",
    complaint: "Hard to switch back to Original Medicare",
    whyItMatters: "People want out of MA but face Medigap underwriting and Part D gaps.",
    signal: "Enrollment option guides, Medigap state rule variations",
    topicIds: ["switch-to-original", "advantage-to-medigap"],
  },
  {
    rank: 9,
    id: "drug-coverage",
    complaint: "Prescription not covered or moved to expensive tier",
    whyItMatters: "Part D formulary changes drive annual shopping and mid-year appeals.",
    signal: "Medicare Part D FAQ, formulary change notices",
    topicIds: ["part-d-formulary", "annual-review-checklist"],
  },
  {
    rank: 10,
    id: "marketing-trust",
    complaint: "Medicare marketing feels misleading",
    whyItMatters: "CMS and state regulators continue tightening TPMO and MA marketing rules.",
    signal: "CMS marketing audits, beneficiary 'designed to confuse' quotes",
    topicIds: ["tv-ad-perks", "zero-premium-explained"],
  },
];

export function getMedicareComplaintResearch(): MedicareComplaintResearch {
  return {
    researchedAt: "2026-06-16",
    sourceNote:
      "Top themes from CMS/OIG reports, Medicare FAQ traffic, and recurring beneficiary forum complaints — refreshed for Learning Center planning.",
    complaints: COMPLAINT_CLUSTERS.map((cluster) => ({
      rank: cluster.rank,
      id: cluster.id,
      complaint: cluster.complaint,
      whyItMatters: cluster.whyItMatters,
      signal: cluster.signal,
      topics: cluster.topicIds.map((id) => {
        const t = TOPIC_TEMPLATES[id];
        return { id, title: t.title, pitch: t.excerpt };
      }),
    })),
  };
}

export function getArticleTopicDraft(topicId: string, publishedAt?: string): ArticleDraft | null {
  const template = TOPIC_TEMPLATES[topicId];
  if (!template) return null;

  return {
    title: template.title,
    slug: template.slug,
    excerpt: template.excerpt,
    category: template.category,
    metaDescription: template.metaDescription,
    featuredImage: featuredImagePublicPath(template.slug, "png"),
    featured: template.featured ?? false,
    published: true,
    sortOrder: 100,
    publishedAt: publishedAt ?? new Date().toISOString().slice(0, 10),
    bodyMd: template.bodyMd,
  };
}

export function listTopicIds(): string[] {
  return Object.keys(TOPIC_TEMPLATES);
}
