import type { Medication } from "@/lib/medicare-math";
import type { PlanDetail } from "@/lib/plan-details";
import { cmsLandscapeIsLoaded } from "@/lib/cms-landscape";

/** Stable key for medication-sensitive premium / drug estimates. */
export function medicationCatalogKey(medications: Medication[]): string {
  if (medications.length === 0) return "none";
  return medications
    .map((med) => `${med.id}|${med.estimated_monthly_retail ?? 0}`)
    .sort()
    .join(";");
}

function normalizeCountyKey(county?: string): string {
  if (!county?.trim()) return "";
  return county.replace(/,\s*[A-Z]{2}\s*$/i, "").trim().toLowerCase();
}

const fullCatalogCache = new Map<string, PlanDetail[]>();
const areaCatalogCache = new Map<string, PlanDetail[]>();

export function fullCatalogCacheKey(year: number, medications: Medication[]): string {
  return `${year}|${medicationCatalogKey(medications)}`;
}

export function areaCatalogCacheKey(
  year: number,
  zip3: string,
  county: string | undefined,
  medications: Medication[],
): string {
  return `${year}|${zip3}|${normalizeCountyKey(county)}|${medicationCatalogKey(medications)}`;
}

export function getCachedFullCatalog(key: string): PlanDetail[] | undefined {
  return fullCatalogCache.get(key);
}

export function setCachedFullCatalog(key: string, plans: PlanDetail[]): PlanDetail[] {
  fullCatalogCache.set(key, plans);
  return plans;
}

export function getCachedAreaCatalog(key: string): PlanDetail[] | undefined {
  return areaCatalogCache.get(key);
}

export function setCachedAreaCatalog(key: string, plans: PlanDetail[]): PlanDetail[] {
  areaCatalogCache.set(key, plans);
  return plans;
}

/** True when raw CMS JSON and the nationwide ranked catalog are already in memory. */
export function isNationwidePlanCatalogWarm(
  year: number,
  medications: Medication[],
): boolean {
  if (!cmsLandscapeIsLoaded()) return false;
  return getCachedFullCatalog(fullCatalogCacheKey(year, medications)) !== undefined;
}

/** Vitest-only — clear memoized catalogs between cases. */
export function __clearPlanCatalogCacheForTests(): void {
  fullCatalogCache.clear();
  areaCatalogCache.clear();
}
