import type { MedicareAd } from "@/types/MedicareAd";
import type { ScoutingAdCategory } from "@/types/scouting-report";

export const SCOUTING_AD_CATEGORY_ORDER: ScoutingAdCategory[] = [
  "fmo",
  "medicare_gov",
  "tpmo",
  "agent",
];

export const SCOUTING_AD_CATEGORY_LABELS: Record<ScoutingAdCategory, string> = {
  fmo: "FMO",
  medicare_gov: "Medicare / Gov",
  tpmo: "TPMO",
  agent: "Agent",
};

export const SCOUTING_AD_CATEGORY_HINTS: Record<ScoutingAdCategory, string> = {
  fmo: "Field marketing org — multi-carrier broker networks and lead funnels",
  medicare_gov: "CMS, Medicare.gov, SSA, or other official government education",
  tpmo: "Third-party marketing org — markets plans on behalf of carriers",
  agent: "Licensed individual agent or producer-led creative",
};

const FMO_HOST_OR_NAME =
  /\b(ehealth|gohealth|selectquote|healthmarkets|smartmatch|devoted|alignment|brokerage|insurance\s+broker)\b/i;

const GOV_HOST =
  /(^|\.)((www\.)?medicare\.gov|cms\.gov|ssa\.gov|hhs\.gov|healthcare\.gov)(\/|$)/i;

const TPMO_TEXT =
  /\b(do not offer every plan|don't offer every plan|not offer all plans|we represent|represents? medicare|third[- ]party|tpmo|not affiliated with (the )?u\.?s\.? government|not connected with medicare|compare (multiple |several )?plans|multiple carriers|plan(s)? in your area)\b/i;

const FMO_TEXT =
  /\b(field marketing|fmo\b|national (distribution|broker)|licensed (sales )?agent network|call center|compare medicare (advantage|plans))\b/i;

const AGENT_TEXT =
  /\b(licensed (insurance )?agent|your local agent|speak with (a |me|an agent)|call (me|today|now)|schedule (a )?call|medicare specialist|independent agent|insurance producer)\b/i;

const GOV_TEXT =
  /\b(medicare\.gov|official medicare|centers for medicare|cms\b|social security administration|government (website|site))\b/i;

function adTextBlob(ad: MedicareAd): string {
  return [
    ad.companyName,
    ad.websiteUrl,
    ad.adUrl,
    ad.primaryText,
    ad.description,
    ad.headline,
    ...(ad.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function looksLikePersonName(companyName: string): boolean {
  const trimmed = companyName.trim();
  if (!trimmed || trimmed.length > 40) return false;
  if (/\b(medicare|insurance|health|broker|agent|llc|inc|corp)\b/i.test(trimmed)) return false;
  return /^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,2}$/.test(trimmed);
}

/** Classify an ad into one or more Medicare marketing categories. */
export function classifyScoutingAdCategories(ad: MedicareAd): ScoutingAdCategory[] {
  const categories = new Set<ScoutingAdCategory>();
  const blob = adTextBlob(ad);
  const hosts = [hostFromUrl(ad.websiteUrl), hostFromUrl(ad.adUrl)].filter(Boolean);

  if (hosts.some((h) => GOV_HOST.test(h)) || GOV_TEXT.test(blob)) {
    categories.add("medicare_gov");
  }

  if (FMO_HOST_OR_NAME.test(blob) || FMO_TEXT.test(blob)) {
    categories.add("fmo");
  }

  if (TPMO_TEXT.test(blob)) {
    categories.add("tpmo");
  }

  if (AGENT_TEXT.test(blob) || looksLikePersonName(ad.companyName)) {
    categories.add("agent");
  }

  // National broker funnels commonly operate as FMO + TPMO.
  if (categories.has("fmo") && TPMO_TEXT.test(blob)) {
    categories.add("tpmo");
  }
  if (
    categories.has("fmo") &&
    /\b(licensed agent|call (a |our )?agent|speak with)\b/i.test(blob)
  ) {
    categories.add("agent");
  }

  // TikTok creator-style posts without a brand name skew agent-led.
  const isTikTok =
    ad.adUrl.includes("tiktok.com") ||
    ad.websiteUrl.includes("tiktok.com") ||
    ad.companyName.toLowerCase().includes("tiktok");
  if (isTikTok && ad.companyName.toLowerCase().includes("user")) {
    categories.add("agent");
  }

  return SCOUTING_AD_CATEGORY_ORDER.filter((c) => categories.has(c));
}

export function mergeScoutingAdCategories(
  groups: ScoutingAdCategory[][],
): ScoutingAdCategory[] {
  const merged = new Set<ScoutingAdCategory>();
  for (const group of groups) {
    for (const cat of group) merged.add(cat);
  }
  return SCOUTING_AD_CATEGORY_ORDER.filter((c) => merged.has(c));
}

export function countAdsByCategory(
  ads: { adCategories: ScoutingAdCategory[] }[],
): Record<ScoutingAdCategory, number> {
  const counts: Record<ScoutingAdCategory, number> = {
    fmo: 0,
    medicare_gov: 0,
    tpmo: 0,
    agent: 0,
  };
  for (const ad of ads) {
    for (const cat of ad.adCategories) {
      counts[cat] += 1;
    }
  }
  return counts;
}
