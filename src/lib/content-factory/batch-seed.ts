import { buildFacebookPostSeedCopy } from "@/lib/content-factory/facebook-post-seed-copy";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/workbook-lead-magnet-seed";
import { SITE_BRAND_THE } from "@/lib/site-brand";
import { workbookFacebookPostTemplate } from "@/lib/content-factory/workbook-facebook-post-templates";
import { buildFeaturedImagePrompt } from "@/lib/article-authoring";
import { getArticleTopicDraft } from "@/lib/medicare-complaint-topics";
import { editorialArticleTopicIdForSlot } from "@/lib/content-factory/editorial-week-topics";
import { editorialWeekStart } from "@/lib/content-factory/weekly-editorial-schedule";
import type { GeneratedAssetInput } from "@/lib/content-factory/ai-provider";
import {
  WEEKLY_CONTENT_BATCH_PLAN,
  type ContentAssetType,
} from "@/lib/content-factory/types";

const FACEBOOK_POSTS = buildFacebookPostSeedCopy();

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
    "- Confirm enrollment deadlines that apply to your situation on https://www.medicare.gov or with SSA",
    "- Compare plans using https://www.medicare.gov/plan-compare — not third-party enrollment sites",
    "- Contact SHIP in your state for free, unbiased help",
    "",
    "Educational only — we do not sell insurance or enroll you in coverage.",
  ].join("\n"),
};

export { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/workbook-lead-magnet-seed";

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

function buildArticleAsset(
  slotIndex: number,
  weekStart: Date = editorialWeekStart(new Date()),
): GeneratedAssetInput {
  const topicId = editorialArticleTopicIdForSlot(weekStart, slotIndex);
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
  const workbook = workbookFacebookPostTemplate(slotIndex);
  const post = workbook ?? FACEBOOK_POSTS[slotIndex];
  return {
    type: "facebook_post",
    slotIndex,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    payload: seedPayload("facebook_post", {
      platform: "facebook",
      slot: slotIndex + 1,
      audience: workbook?.audience ?? "facebook_page",
    }),
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
    title: DEFAULT_WORKBOOK_LEAD_MAGNET.title,
    excerpt: DEFAULT_WORKBOOK_LEAD_MAGNET.excerpt,
    body: DEFAULT_WORKBOOK_LEAD_MAGNET.body,
    payload: seedPayload("lead_magnet", {
      format: "pdf",
      suggestedSlug: "PBO_Turning_65_Workbook",
    }),
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
export function generateWeeklyBatchAssets(
  topic: string,
  _batchId: string,
  weekStart: Date = editorialWeekStart(new Date()),
): GeneratedAssetInput[] {
  const assets: GeneratedAssetInput[] = [];

  for (const slot of WEEKLY_CONTENT_BATCH_PLAN) {
    for (let i = 0; i < slot.count; i++) {
      switch (slot.type) {
        case "article":
          assets.push(buildArticleAsset(i, weekStart));
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
