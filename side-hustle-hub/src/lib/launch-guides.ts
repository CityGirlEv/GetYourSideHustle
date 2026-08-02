/**
 * Canonical Launch Guide / hustle IDs used by StepByStepGuides + HUSTLES_DATA.
 * When you add a new hustle guide, add { id, name, peek } here so
 * ensureGuideReviewTasks() can create a matching Task List review item,
 * and the checklist page can show organized sneak peeks.
 *
 * `peek` mirrors the "bestFor" one-liner from StepByStepGuides (adult/general).
 */
export type LaunchGuideRef = {
  id: string;
  name: string;
  /** Short sneak-peek blurb for browse lists (not the full guide). */
  peek: string;
  /** @deprecated Prefer guide-access minTier; kept for catalog badges during transition. */
  free?: boolean;
};

export const LAUNCH_GUIDES: LaunchGuideRef[] = [
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
    peek: "Creators who want to sell ebooks, printables, templates, and courses — separate from affiliate links.",
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
    free: true,
  },
  {
    id: "food-delivery",
    name: "DoorDash / Uber Eats",
    peek: "Anyone needing low-barrier income with a bike, scooter, or car.",
    free: true,
  },
  {
    id: "ai-timing",
    name: "AI Timing Scout",
    peek: "Research-minded Side Hustlers who want to boost gig earnings or sell hotspot playbooks.",
  },
  {
    id: "ai-agents",
    name: "AI Agents for Side Hustlers",
    peek: "Builders who can productize agent setups (lead find, scheduling, research) for other Side Hustlers.",
  },
  {
    id: "book-publishing",
    name: "Book Publishing",
    peek: "A Digital path for writers and storytellers (Tina's lane) — manuscripts to royalty income; kids can publish too.",
  },
];

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
  return `Open [Guides](/guides)\nguide-review:${guideId}`;
}
