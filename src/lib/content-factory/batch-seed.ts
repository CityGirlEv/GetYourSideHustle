import { SITE_BRAND_NAME, SITE_BRAND_THE } from "@/lib/site-brand";
import { buildFeaturedImagePrompt } from "@/lib/article-authoring";
import { getArticleTopicDraft } from "@/lib/medicare-complaint-topics";
import type { GeneratedAssetInput } from "@/lib/content-factory/ai-provider";
import {
  WEEKLY_CONTENT_BATCH_PLAN,
  type ContentAssetType,
} from "@/lib/content-factory/types";

const ARTICLE_TOPIC_IDS = [
  "prior-auth-overview",
  "medigap-window",
  "zero-premium-explained",
] as const;

const FACEBOOK_POSTS = [
  {
    title: `Welcome to ${SITE_BRAND_THE}! Learn about Medicare Prior Authorization`,
    excerpt: "Welcome post introducing the page and linking to our first Learning Center article.",
    body: `Welcome to the ${SITE_BRAND_THE} page! 🌟

Turning 65 comes with a lot of decisions — and unfortunately, a lot of high-pressure sales calls. We’re here to change that.

Our mission is simple: to provide calm, clear, and completely unbiased Medicare education. No sales pitches, no pushy agents, and no government affiliation — just honest resources to help you take control of your healthcare journey.

To kick things off, we’ve just published our very first Learning Center guide: "What Is Medicare Prior Authorization? A Plain-Language Overview." If you've ever wondered how prior authorizations work and how to protect yourself from surprise coverage denials, read our walkthrough here:

👉 https://mypartb.com/learning-center/what-is-medicare-prior-authorization

Like our page to follow along as we share weekly tips, checklists, and official resources.

Educational purposes only. We do not sell insurance or solicit enrollments. We are not affiliated with or endorsed by Medicare, CMS, or any government agency.

#MedicareEducation #Turning65 #MedicareSimplified #HealthcareTransparency`,
  },
  {
    title: "The Medigap Open Enrollment Window: Why Timing Matters",
    excerpt: "Share Article 2 and invite friends to follow our page.",
    body: `If you are new to Medicare Part B, you generally have a one-time six-month Medigap open enrollment window where guaranteed-issue rules protect you.

Missing this window is one of the most common regrets we hear about, as you may face medical underwriting later if you try to switch to a supplemental plan.

Read our plain-language guide on why timing is critical:
👉 https://mypartb.com/learning-center/medigap-open-enrollment-window-explained

📌 Help us spread the word! Invite friends or family members who are turning 65 to follow the ${SITE_BRAND_THE} page for transparent, non-sales education.

Educational only. Verify your state's supplemental insurance rules.

#MedicareEducation #Medigap #Turning65`,
  },
  {
    title: "A $0 premium is not the same as $0 total cost",
    excerpt: "Educational post linking to Article 3 on Medicare Advantage premiums.",
    body: `Many Medicare Advantage plans advertise a $0 monthly premium. Copays, deductibles, and out-of-network bills can still add up.

Compare the full cost picture — not just the headline premium. Read our plain-language guide on what $0 premiums really mean:
👉 https://mypartb.com/learning-center/medicare-advantage-zero-premium-explained

Educational only — not a solicitation to enroll.

#MedicareEducation #ComparePlans #MedicareAdvantage`,
  },
  {
    title: "Still working at 65? Check employer size first",
    excerpt: "Educational post on Medicare and employer coverage coordination.",
    body: `Turning 65 while you still have employer health coverage?

Before you defer Part B, confirm whether your employer has 20 or more employees — that detail changes whether Medicare is primary or secondary.

Educational only. Verify your timeline with SSA and Medicare.gov.

#MedicareEducation #Turning65`,
  },
  {
    title: "TV ads make Medicare sound simple — compare the documents",
    excerpt: "Reminder to read Evidence of Coverage, not just marketing perks.",
    body: `Dental and vision perks are easy to understand in Medicare ads. Networks, prior authorization, and cost-sharing rules often live deeper in the plan booklet.

Match ad claims to official plan documents before you choose.

Educational only — not a solicitation to enroll.

#MedicareEducation`,
  },
  {
    title: "Is your doctor in network for next year?",
    excerpt: "Annual reminder to verify provider directories before enrollment.",
    body: `Plan networks can change every contract year. A doctor who was in network last year may not be next year.

Verify providers on Medicare.gov Plan Finder before you assume you can keep the same care team.

#MedicareEducation`,
  },
  {
    title: "Part D formulary changes can surprise you mid-year",
    excerpt: "Educational post on prescription tier changes and appeals.",
    body: `Each Part D plan maintains its own drug list. A medication can move tiers or require prior authorization without much fanfare.

Keep your bottle handy when comparing plans on Medicare.gov.

#MedicareEducation #PartD`,
  },
];

const NEWSLETTER = {
  title: "Weekly Learning Center Roundup",
  excerpt: "Educational newsletter linking to new Medicare guides and enrollment reminders.",
  body: [
    "Subject: This week in Medicare education — enrollment timing, plan comparisons, and official resources",
    "",
    "Hello {{fullName}},",
    "",
    `Welcome to this week's Learning Center roundup from ${SITE_BRAND_THE}. We publish plain-language Medicare education — not enrollment sales.`,
    "",
    "## Featured guides",
    "",
    "- What to verify before you assume a service is covered (prior authorization overview)",
    "- Why the Medigap open enrollment window matters when you first sign up for Part B",
    "- How to read $0 premium marketing without missing real out-of-pocket costs",
    "",
    "## Quick reminders",
    "",
    "- Confirm enrollment deadlines that apply to your situation on Medicare.gov or with SSA",
    "- Compare plans using official tools before sharing personal identifiers online",
    "- Contact SHIP in your state for free, unbiased help",
    "",
    "Educational only — we do not sell insurance or enroll you in coverage.",
  ].join("\n"),
};

const LEAD_MAGNET = {
  title: "Medicare at 65 Planning Workbook",
  excerpt: "Printable checklist to gather facts before comparing Medicare options.",
  body: [
    "# Medicare at 65 Planning Workbook",
    "",
    "## Before you compare plans",
    "",
    "- List every prescription with exact dosage",
    "- Write down preferred doctors, specialists, and hospitals",
    "- Note whether you are still working and whether your employer has 20+ employees",
    "- Gather current premium and deductible amounts for existing coverage",
    "",
    "## Questions for your review meeting",
    "",
    "- Do I need Part B now or can I delay without a penalty?",
    "- Would Original Medicare plus Medigap or a Medicare Advantage plan fit my care patterns?",
    "- How do my drugs appear on each plan formulary?",
    "",
    "## Official sources to verify",
    "",
    "- Medicare.gov and 1-800-MEDICARE",
    "- Social Security Administration for Part B enrollment",
    "- Your State Health Insurance Assistance Program (SHIP)",
    "",
    "Educational workbook only — not personalized enrollment advice.",
  ].join("\n"),
};

const FAQ_ITEMS = [
  {
    q: "Is this educational content enrollment advice?",
    a: "No. Learning Center and Content Factory materials are educational only. They do not recommend specific plans, carriers, or enrollment actions.",
  },
  {
    q: "Where should I verify official Medicare rules?",
    a: "Use Medicare.gov, 1-800-MEDICARE, or your State Health Insurance Assistance Program (SHIP) for rules that apply to you.",
  },
  {
    q: "Can I delay Part B if I have employer coverage?",
    a: "You may be able to delay without a late penalty if you have qualifying employer coverage — but employer size and coordination rules matter. Confirm with your benefits office and SSA.",
  },
  {
    q: "Does a $0 premium plan mean free healthcare?",
    a: "No. Premium is only one part of cost. Copays, deductibles, networks, and out-of-pocket maximums still apply.",
  },
];

const IMAGE_PROMPT_TOPICS = [
  {
    title: "What Is Medicare Prior Authorization? A Plain-Language Overview",
    excerpt: "Why some Medicare plans require approval before care — and what to verify before you assume a service is covered.",
    category: "comparing-plans" as const,
  },
  {
    title: "The Medigap Open Enrollment Window: Why Timing Matters",
    excerpt: "A calm overview of the six-month Medigap window when guaranteed-issue rules work differently.",
    category: "enrollment" as const,
  },
  {
    title: 'Medicare Advantage $0 Premiums: What "Free" Does and Does Not Mean',
    excerpt: "Zero monthly premium does not mean zero cost — here is what to compare in the fine print.",
    category: "plan-types" as const,
  },
  {
    title: "Medicare Enrollment Periods: A Calm Overview",
    excerpt: "A non-sales overview of common Medicare enrollment windows and why timing matters.",
    category: "enrollment" as const,
  },
  {
    title: "How to Compare Medicare Plans Without the Sales Pressure",
    excerpt: "Use side-by-side educational comparisons and official sources before making coverage decisions.",
    category: "comparing-plans" as const,
  },
];

function seedPayload(type: ContentAssetType, extra: Record<string, unknown> = {}) {
  return { provider: "seed", source: "weekly-batch", type, ...extra };
}

function buildArticleAsset(slotIndex: number): GeneratedAssetInput {
  const topicId = ARTICLE_TOPIC_IDS[slotIndex % ARTICLE_TOPIC_IDS.length];
  const draft = getArticleTopicDraft(topicId);
  if (!draft) {
    throw new Error(`Missing article seed for topic ${topicId}`);
  }
  return {
    type: "article",
    slotIndex,
    title: draft.title,
    excerpt: draft.excerpt,
    body: draft.bodyMd,
    payload: seedPayload("article", {
      category: draft.category,
      suggestedSlug: draft.slug,
      topicId,
    }),
  };
}

function buildFacebookAsset(slotIndex: number): GeneratedAssetInput {
  const post = FACEBOOK_POSTS[slotIndex % FACEBOOK_POSTS.length];
  return {
    type: "facebook_post",
    slotIndex,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    payload: seedPayload("facebook_post", { platform: "facebook", slot: slotIndex + 1 }),
  };
}

function buildNewsletterAsset(): GeneratedAssetInput {
  return {
    type: "newsletter",
    slotIndex: 0,
    title: NEWSLETTER.title,
    excerpt: NEWSLETTER.excerpt,
    body: NEWSLETTER.body,
    payload: seedPayload("newsletter", { audience: "learning_center_subscribers" }),
  };
}

function buildLeadMagnetAsset(): GeneratedAssetInput {
  return {
    type: "lead_magnet",
    slotIndex: 0,
    title: LEAD_MAGNET.title,
    excerpt: LEAD_MAGNET.excerpt,
    body: LEAD_MAGNET.body,
    payload: seedPayload("lead_magnet", { format: "pdf" }),
  };
}

function buildFaqAsset(): GeneratedAssetInput {
  return {
    type: "faq",
    slotIndex: 0,
    title: "Medicare Enrollment FAQ Collection",
    excerpt: "Accordion-ready educational FAQ for Learning Center articles and social follow-ups.",
    body: FAQ_ITEMS.map((item) => `### ${item.q}\n\n${item.a}`).join("\n\n"),
    payload: seedPayload("faq", { items: FAQ_ITEMS.length }),
  };
}

function buildImagePromptAsset(slotIndex: number): GeneratedAssetInput {
  const topic = IMAGE_PROMPT_TOPICS[slotIndex % IMAGE_PROMPT_TOPICS.length];
  const suggestedSlug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
  const prompt = buildFeaturedImagePrompt({ ...topic, slug: suggestedSlug });
  return {
    type: "image_prompt",
    slotIndex,
    title: `Featured image: ${topic.title}`,
    excerpt: "TPMO-safe hero image prompt for Learning Center article headers.",
    body: prompt,
    payload: seedPayload("image_prompt", {
      aspectRatio: "3:2",
      suggestedSlug,
    }),
  };
}

/** Seeds weekly batch assets from curated Medicare education content (no AI API). */
export function generateWeeklyBatchAssets(topic: string, _batchId: string): GeneratedAssetInput[] {
  const assets: GeneratedAssetInput[] = [];

  for (const slot of WEEKLY_CONTENT_BATCH_PLAN) {
    for (let i = 0; i < slot.count; i++) {
      switch (slot.type) {
        case "article":
          assets.push(buildArticleAsset(i));
          break;
        case "facebook_post":
          assets.push(buildFacebookAsset(i));
          break;
        case "newsletter":
          assets.push(buildNewsletterAsset());
          break;
        case "lead_magnet":
          assets.push(buildLeadMagnetAsset());
          break;
        case "faq":
          assets.push(buildFaqAsset());
          break;
        case "image_prompt":
          assets.push(buildImagePromptAsset(i));
          break;
      }
    }
  }

  void topic;
  return assets;
}
