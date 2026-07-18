import { CMS_CATALOG } from "@/data/cms-catalog";
import type { PlanDetail } from "@/lib/plan-details";
import {
  isBlockedMedicareLeadGenHost,
  MEDICARE_PLAN_COMPARE_URL,
} from "@/lib/safe-external-links";

function allCatalogCarriers() {
  return [
    ...CMS_CATALOG.medigapCarriers,
    ...CMS_CATALOG.advantageCarriers,
    ...CMS_CATALOG.partDCarriers,
  ];
}

function isSafeCarrierPortal(url: string): boolean {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return !isBlockedMedicareLeadGenHost(host);
  } catch {
    return false;
  }
}

/** CMS catalog carrier portal when available. */
export function carrierPortalUrl(carrierName: string): string | null {
  const normalized = carrierName.trim().toLowerCase();
  const match = allCatalogCarriers().find(
    (c) => c["Carrier Name"].trim().toLowerCase() === normalized,
  );
  const portal = match?.["Carrier Portal"]?.trim();
  if (!portal || !isSafeCarrierPortal(portal)) return null;
  return portal;
}

/** Official Medicare.gov plan compare with optional ZIP prefix context. */
export function medicarePlanCompareUrl(options?: { zip3?: string; year?: number }): string {
  const url = new URL(MEDICARE_PLAN_COMPARE_URL);
  if (options?.year) url.searchParams.set("year", String(options.year));
  if (options?.zip3 && /^\d{3}$/.test(options.zip3)) {
    url.searchParams.set("zip", `${options.zip3}00`);
  }
  return url.toString();
}

/** Best external URL for a ranked plan — carrier site when catalogued, else Medicare.gov. */
export function planDetailExternalUrl(
  plan: PlanDetail,
  options?: { zip3?: string; year?: number },
): string {
  return carrierPortalUrl(plan.carrier) ?? medicarePlanCompareUrl(options);
}

export function planExternalLinkLabel(plan: PlanDetail): string {
  return carrierPortalUrl(plan.carrier)
    ? `View ${plan.carrier} Medicare plans`
    : "Find this plan on Medicare.gov";
}
