import type { Blueprint } from "../types";
import { LAUNCH_GUIDES } from "./launch-guides";
import { KIDS_GUIDES } from "./kids-content";

/** Map Match Wizard / blueprint hustle ids → Kids Corner guide ids when they differ. */
const HUSTLE_TO_KIDS_GUIDE: Record<string, string> = {
  "lemonade-stand": "lemonade",
  "bake-sale": "bake-sale",
  "pet-sitting": "pet-sitting",
  "chore-helper": "chore-helper",
  "craft-sales": "craft-sales",
  "yard-help": "yard-help",
  "car-wash": "car-wash",
  tutoring: "tutoring",
  "tech-help": "tech-help",
  "social-media": "social-media",
  "resale-flipping": "resale",
  "content-creator": "content-creator",
  "event-help": "event-help",
  "coding-gigs": "coding-gigs",
};

/** Senior Match Wizard opportunity ids → adult Launch Guide ids when available. */
const SENIOR_TO_LAUNCH_GUIDE: Record<string, string> = {
  consulting: "coaching",
  tutoring: "tutoring",
  "handyman-light": "handyman",
  crafts: "crafts",
  "pet-sitting": "pet-sitting",
  "str-cohost": "airbnb",
  bookkeeping: "bookkeeping",
  teaching: "tutoring",
  affiliate: "affiliate",
  "ai-peers": "ai-services",
  rideshare: "rideshare",
};

export type BlueprintGuideTarget =
  | { kind: "adult"; launchGuideId: string }
  | { kind: "kids"; guideId: string; mode: "kids" | "junior" }
  | { kind: "seniors"; opportunityId?: string };

function normalizeId(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "-");
}

export function resolveKidsGuideId(hustleId: string): string | null {
  const id = normalizeId(hustleId);
  if (KIDS_GUIDES.some((g) => g.id === id)) return id;
  const mapped = HUSTLE_TO_KIDS_GUIDE[id];
  if (mapped && KIDS_GUIDES.some((g) => g.id === mapped)) return mapped;
  const byTitle = KIDS_GUIDES.find(
    (g) => normalizeId(g.title) === id || normalizeId(g.title).includes(id) || id.includes(normalizeId(g.title)),
  );
  return byTitle?.id ?? null;
}

export function resolveAdultLaunchGuideId(hustleId: string): string | null {
  const id = normalizeId(hustleId);
  if (LAUNCH_GUIDES.some((g) => g.id === id)) return id;
  const mapped = SENIOR_TO_LAUNCH_GUIDE[id];
  if (mapped && LAUNCH_GUIDES.some((g) => g.id === mapped)) return mapped;
  const byTitle = LAUNCH_GUIDES.find(
    (g) => normalizeId(g.title) === id || normalizeId(g.title).includes(id),
  );
  return byTitle?.id ?? null;
}

/** Where Guide should send the user for this saved blueprint match. */
export function resolveBlueprintGuideTarget(bp: Blueprint): BlueprintGuideTarget | null {
  const hustleId = String(bp.topMatch?.id || "").trim();
  if (!hustleId) return null;

  if (bp.audience === "kids" || bp.audience === "junior") {
    const guideId = resolveKidsGuideId(hustleId);
    if (!guideId) return null;
    return { kind: "kids", guideId, mode: bp.audience === "junior" ? "junior" : "kids" };
  }

  if (bp.audience === "seniors") {
    const launchGuideId = resolveAdultLaunchGuideId(hustleId);
    if (launchGuideId) return { kind: "adult", launchGuideId };
    return { kind: "seniors", opportunityId: hustleId };
  }

  const launchGuideId = resolveAdultLaunchGuideId(hustleId);
  if (!launchGuideId) return null;
  return { kind: "adult", launchGuideId };
}

export function canOpenBlueprintGuide(bp: Blueprint): boolean {
  return resolveBlueprintGuideTarget(bp) != null;
}
