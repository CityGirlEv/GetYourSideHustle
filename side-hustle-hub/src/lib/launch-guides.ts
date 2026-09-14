/**
 * Canonical Launch Guide / hustle IDs used by StepByStepGuides + HUSTLES_DATA.
 * When you add a new hustle guide, add { id, name, peek } here so
 * ensureGuideReviewTasks() can create a matching Task List review item,
 * and the checklist page can show organized sneak peeks.
 *
 * `peek` mirrors the "bestFor" one-liner from StepByStepGuides (adult/general).
 */
import { adultGuideMinTier, guideTierSortRank } from "./guide-access";
import {
  PRO_SPREAD_HUSTLE_IDS,
  STARTER_SPREAD_HUSTLE_IDS,
  freeWizardLaunchGuideRefs,
  hustleById,
  hustleCardPeek,
} from "./side-hustle-catalog";

export type LaunchGuideRef = {
  id: string;
  name: string;
  /** Short sneak-peek blurb for browse lists (not the full guide). */
  peek: string;
  /** @deprecated Prefer guide-access minTier; kept for catalog badges during transition. */
  free?: boolean;
};

/** Free Membership guides first, then Starter → Pro → Elite (name tie-break). */
export function sortGuidesFreeFirst<T extends { id: string; name?: string; title?: string }>(
  guides: T[],
  minTierOf: (id: string) => ReturnType<typeof adultGuideMinTier> = adultGuideMinTier,
): T[] {
  return [...guides].sort((a, b) => {
    const tr = guideTierSortRank(minTierOf(a.id)) - guideTierSortRank(minTierOf(b.id));
    if (tr !== 0) return tr;
    const nameA = a.name ?? a.title ?? a.id;
    const nameB = b.name ?? b.title ?? b.id;
    return nameA.localeCompare(nameB);
  });
}

const CORE_LAUNCH_GUIDES: LaunchGuideRef[] = [
  {
    id: "airbnb",
    name: "Airbnb Hosting",
    peek: "Property owners or sublease managers looking to monetize space.",
  },
  {
    id: "pod",
    name: "Print-on-Demand (POD)",
    peek: "Creatives and designers who want zero inventory risk.",
  },
  {
    id: "dropshipping",
    name: "Dropshipping Business",
    peek: "Digital marketers ready to run paid advertisements.",
  },
  {
    id: "digital-products",
    name: "Digital Products",
    peek: "Creators who want to sell ebooks, printables, planners, templates, and mini-courses — separate from affiliate links.",
  },
  {
    id: "affiliate",
    name: "Affiliate Marketing",
    peek: "Writers, bloggers, and review content creators.",
  },
  {
    id: "amazon",
    name: "Amazon FBA (Fulfillment by Amazon)",
    peek: "Aspiring physical brand builders with capital ready to invest.",
  },
  {
    id: "social",
    name: "Social Influencer & Creator",
    peek: "Charismatic storytellers who enjoy editing and content creation.",
  },
  {
    id: "web-leads",
    name: "Local Website Lead Finder",
    peek: "People who like outreach, local business, and light web builds.",
  },
  {
    id: "ai-assets",
    name: "AI Asset Studio",
    peek: "Creatives who want productized design work without agency overhead.",
  },
  {
    id: "property-mgmt",
    name: "Property Management",
    peek: "Operators with Airbnb/STR experience who want recurring door-based income.",
  },
  {
    id: "handyman",
    name: "Handyman Services",
    peek: "Hands-on folks with basic tools who want local cash jobs fast.",
  },
  {
    id: "rideshare",
    name: "Rideshare (Uber / Lyft)",
    peek: "Drivers who want flexible hours and immediate payouts.",
  },
  {
    id: "food-delivery",
    name: "DoorDash / Uber Eats",
    peek: "Anyone needing low-barrier income with a bike, scooter, or car.",
  },
  {
    id: "ai-timing",
    name: "AI Rideshare Timing Scout",
    peek: "Licensed drivers and researchers who study local ZIP, event, and commute windows — then test or sell dated playbooks.",
  },
  {
    id: "ai-agents",
    name: "AI Agents for Side Hustlers",
    peek: "Adults, seniors/retirees, and experienced teens with adult-managed accounts who can sell one narrow supervised workflow.",
  },
  {
    id: "book-publishing",
    name: "Book Publishing",
    peek: "Write, edit, package, and publish print, ebook, and optional audio with KDP/IngramSpark — then market and measure profit.",
  },
];

const existingIds = new Set(CORE_LAUNCH_GUIDES.map((g) => g.id));

function catalogExtras(ids: readonly string[]): LaunchGuideRef[] {
  return ids
    .filter((id) => !existingIds.has(id) && hustleById(id))
    .map((id) => {
      const h = hustleById(id)!;
      return {
        id: h.id,
        name: h.name,
        peek: hustleCardPeek(h),
      };
    });
}

const freeWizardExtras = freeWizardLaunchGuideRefs().filter((ref) => !existingIds.has(ref.id));
for (const ref of freeWizardExtras) existingIds.add(ref.id);

const starterExtras = catalogExtras(STARTER_SPREAD_HUSTLE_IDS);
for (const ref of starterExtras) existingIds.add(ref.id);

const proExtras = catalogExtras(PRO_SPREAD_HUSTLE_IDS);

/** Core + Free + Starter/Pro spreads — Free Membership guides listed first. */
export const LAUNCH_GUIDES: LaunchGuideRef[] = sortGuidesFreeFirst([
  ...CORE_LAUNCH_GUIDES,
  ...freeWizardExtras,
  ...starterExtras,
  ...proExtras,
]);

export function hasLaunchGuide(guideId: string): boolean {
  return LAUNCH_GUIDES.some((g) => g.id === guideId);
}

export function guideReviewTaskId(guideId: string): string {
  return `T-LG-${guideId}`;
}

export function guideReviewDescription(name: string): string {
  return `Review Launch Guide: ${name} — verify steps, costs, and verbiage`;
}

export function guideReviewNotes(guideId: string): string {
  return `Open [Guide](/guides?hustle=${encodeURIComponent(guideId)})\nguide-review:${guideId}`;
}
