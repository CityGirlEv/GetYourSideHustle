/**
 * Presentable Launch Guide titles — never show raw kebab-case ids like
 * `car-interior-cleanup` in the library, wizard, or open-guide header.
 */

import { hustleById } from "./side-hustle-catalog";
import { kidsGuideById } from "./kids-guides";

const SLUG_WORD_OVERRIDES: Record<string, string> = {
  ai: "AI",
  api: "API",
  crm: "CRM",
  diy: "DIY",
  etsy: "Etsy",
  fba: "FBA",
  fb: "FB",
  gps: "GPS",
  kdp: "KDP",
  llc: "LLC",
  mgmt: "Management",
  pdf: "PDF",
  pod: "POD",
  seo: "SEO",
  sms: "SMS",
  str: "STR",
  ugc: "UGC",
  url: "URL",
  va: "VA",
};

/** True when a title is a raw guide id / kebab slug, not a human name. */
export function isUnpresentableGuideTitle(value: string, guideId?: string): boolean {
  const v = String(value || "").trim();
  if (!v) return true;
  if (guideId && v === String(guideId).trim()) return true;
  if (/\s/.test(v)) return false;
  if (/[A-Z]/.test(v)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
}

/** Title-case a kebab id when no catalog name exists. */
export function titleFromGuideSlug(guideId: string): string {
  const id = String(guideId || "").trim();
  if (!id) return "Guide";
  return id
    .split("-")
    .filter(Boolean)
    .map((word) => SLUG_WORD_OVERRIDES[word] ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Prefer catalog / kids titles. Ignore slug overlays (`car-interior-cleanup`)
 * so members never see the internal id as the guide name.
 */
export function presentableGuideTitle(guideId: string, rawName?: string | null): string {
  const id = String(guideId || "").trim();
  const candidate = String(rawName || "").trim();
  if (candidate && !isUnpresentableGuideTitle(candidate, id)) return candidate;
  const catalog = hustleById(id)?.name?.trim();
  if (catalog && !isUnpresentableGuideTitle(catalog, id)) return catalog;
  const kids = kidsGuideById(id)?.title?.trim();
  if (kids && !isUnpresentableGuideTitle(kids, id)) return kids;
  return titleFromGuideSlug(id);
}
