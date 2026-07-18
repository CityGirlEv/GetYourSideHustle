import { multiSelectMatches } from "@/components/ui/multi-select";
import { buildAreaPlanCatalog, type AreaPlanCatalogInput } from "@/lib/plan-area-catalog";
import type { PlanDetail } from "@/lib/plan-details";
import { filterAreaPlans, planFilterCounts, type PlanFilterId } from "@/lib/plan-filters";
import { lookupCountiesForZip, type CountyMatch } from "@/lib/zip-county-lookup";
import {
  normalizeZip3Input,
  normalizeCountyName,
  countiesForZip3,
  countyMatchesZip3,
  formatCountyOptionLabel,
  type Zip3County,
} from "@/lib/zip3-county-lookup";

export type ZipReportInputMode = "zip3" | "zip5";

export type ZipCountyReportViewFilters = {
  planFilter: PlanFilterId;
  /** Empty = all counties; ["__none__"] = none. */
  countyKeys: string[];
};

export type ZipCountyPlanCategory =
  | "medicare-advantage"
  | "medicare-part-d"
  | "medicare-supplement";

export type ZipCountyPlanGroup = {
  category: ZipCountyPlanCategory;
  label: string;
  plans: PlanDetail[];
};

export type ZipCountyPlansEntry = {
  county: Zip3County;
  countyLabel: string;
  groups: ZipCountyPlanGroup[];
  totalPlans: number;
};

export type ZipCountyPlansReport = {
  zipCode: string;
  zip3: string;
  /** Whether the user entered a 3-digit prefix or a full 5-digit ZIP. */
  inputMode: ZipReportInputMode;
  counties: ZipCountyPlansEntry[];
  totalPlans: number;
  generatedAt: string;
};

const CATEGORY_LABELS: Record<ZipCountyPlanCategory, string> = {
  "medicare-advantage": "Medicare Advantage",
  "medicare-part-d": "Medicare Part D",
  "medicare-supplement": "Medicare Supplement (Medigap)",
};

/** Normalize user input to a 5-digit ZIP (or partial while typing). */
export function normalizeZipCodeInput(raw: string): string {
  return raw
    .replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30))
    .replace(/\D/g, "")
    .slice(0, 5);
}

/** True when the value is a complete 5-digit ZIP. */
export function isCompleteZipCode(zip: string): boolean {
  return /^\d{5}$/.test(normalizeZipCodeInput(zip));
}

/** Whether input is exactly 3 digits (prefix) or 5 digits (full ZIP). */
export function zipReportInputMode(input: string): ZipReportInputMode | null {
  const digits = normalizeZipCodeInput(input);
  if (/^\d{5}$/.test(digits)) return "zip5";
  if (/^\d{3}$/.test(digits)) return "zip3";
  return null;
}

/** True when the value is a complete 3- or 5-digit ZIP for the county report. */
export function isCompleteZipInput(input: string): boolean {
  return zipReportInputMode(input) != null;
}

/** True when input matches the selected report mode (3-digit prefix vs full ZIP). */
export function isCompleteZipInputForMode(input: string, mode: ZipReportInputMode): boolean {
  const digits = normalizeZipCodeInput(input);
  if (mode === "zip3") return /^\d{3}$/.test(digits);
  return /^\d{5}$/.test(digits);
}

/** Max digits allowed while typing for the selected report mode. */
export function zipInputMaxLengthForMode(mode: ZipReportInputMode): number {
  return mode === "zip3" ? 3 : 5;
}

/** Counties for a 3-digit prefix (sync). */
export function countiesForZip3ReportInput(input: string): Zip3County[] {
  if (zipReportInputMode(input) !== "zip3") return [];
  return countiesForZip3(normalizeZip3Input(input));
}

/**
 * Pick the primary county for a full ZIP from lookup matches.
 * Uses lookup order (first place in the ZIP) and maps to the prefix county list.
 * Returns [] when lookup finds nothing mappable — never all prefix counties.
 */
export function pickPrimaryZip5County(
  prefixCounties: Zip3County[],
  matches: Pick<CountyMatch, "county" | "stateCode">[],
  zip3?: string,
): Zip3County[] {
  if (!prefixCounties.length || !matches.length) return [];
  for (const match of matches) {
    const hit =
      prefixCounties.find(
        (pc) =>
          pc.stateCode === match.stateCode &&
          normalizeCountyName(pc.county) === normalizeCountyName(match.county),
      ) ?? (zip3 ? countyMatchesZip3(match.county, zip3) : null);
    if (hit?.stateCode === match.stateCode) return [hit];
  }
  return [];
}

/** @deprecated Use pickPrimaryZip5County — kept as alias for existing tests/callers. */
export function narrowZip3CountiesByMatches(
  prefixCounties: Zip3County[],
  matches: Pick<CountyMatch, "county" | "stateCode">[],
): Zip3County[] {
  return pickPrimaryZip5County(prefixCounties, matches);
}

/** Resolve counties for report input — all prefix counties for ZIP3, one county for ZIP5. */
export async function resolveCountiesForZipInput(
  input: string,
  mode?: ZipReportInputMode,
): Promise<Zip3County[]> {
  const normalized = normalizeZipCodeInput(input);
  const resolvedMode = mode ?? zipReportInputMode(normalized);
  if (!resolvedMode) return [];
  const zip3 = normalizeZip3Input(normalized);
  const prefixCounties = countiesForZip3(zip3);
  if (!prefixCounties.length) return [];
  if (resolvedMode === "zip3") return prefixCounties;
  try {
    const matches = await lookupCountiesForZip(normalized);
    return pickPrimaryZip5County(prefixCounties, matches, zip3);
  } catch {
    return [];
  }
}

/** Sync county preview while typing — prefix counties for ZIP3 only. */
export function countiesForZipCode(input: string): Zip3County[] {
  if (zipReportInputMode(input) !== "zip3") return [];
  return countiesForZip3(normalizeZip3Input(input));
}

function categorizePlan(plan: PlanDetail): ZipCountyPlanCategory {
  const type = plan.planType.toLowerCase();
  if (/medicare advantage|advantage \(/.test(type)) return "medicare-advantage";
  if (/part d|pdp/.test(type)) return "medicare-part-d";
  return "medicare-supplement";
}

/** Group plans by MA / Part D / Medigap for display. */
export function groupPlansByCategory(plans: PlanDetail[]): ZipCountyPlanGroup[] {
  const buckets: Record<ZipCountyPlanCategory, PlanDetail[]> = {
    "medicare-advantage": [],
    "medicare-part-d": [],
    "medicare-supplement": [],
  };

  for (const plan of plans) {
    buckets[categorizePlan(plan)].push(plan);
  }

  return (Object.keys(buckets) as ZipCountyPlanCategory[])
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      plans: buckets[category],
    }))
    .filter((group) => group.plans.length > 0);
}

/** All plans across every county entry in a report. */
export function zipCountyReportAllPlans(report: ZipCountyPlansReport): PlanDetail[] {
  return report.counties.flatMap((entry) => entry.groups.flatMap((group) => group.plans));
}

/** Filter plans within a county report using the same plan-type bubbles as Potential Options. */
export function filterZipCountyReportPlans(
  plans: PlanDetail[],
  filter: PlanFilterId,
): PlanDetail[] {
  return filterAreaPlans(plans, filter, []);
}

/** Plan-type bubble counts for an assembled county report. */
export function zipCountyReportPlanFilterCounts(
  report: ZipCountyPlansReport,
): Record<PlanFilterId, number> {
  return planFilterCounts(zipCountyReportAllPlans(report), []);
}

/** Apply a plan-type filter to one county entry; returns null when no plans match. */
export function filterZipCountyReportEntry(
  entry: ZipCountyPlansEntry,
  filter: PlanFilterId,
): ZipCountyPlansEntry | null {
  const allPlans = entry.groups.flatMap((group) => group.plans);
  const filtered = filterZipCountyReportPlans(allPlans, filter);
  if (filtered.length === 0) return null;
  return {
    ...entry,
    groups: groupPlansByCategory(filtered),
    totalPlans: filtered.length,
  };
}

/** Stable key for county multiselect options. */
export function countyKeyForZip3County(county: Zip3County): string {
  return `${county.stateCode}::${county.county}`;
}

export function countyKeyForEntry(entry: ZipCountyPlansEntry): string {
  return countyKeyForZip3County(entry.county);
}

/** Dropdown options for a ZIP3 prefix county list (before or after report build). */
export function zip3CountySelectOptions(counties: Zip3County[]): { value: string; label: string }[] {
  return counties.map((county) => ({
    value: countyKeyForZip3County(county),
    label: formatCountyOptionLabel(county),
  }));
}

/** Apply multiselect state to a ZIP3 county list. Empty selection = all counties. */
export function filterZip3CountiesByKeys(
  counties: Zip3County[],
  countyKeys: string[],
): Zip3County[] {
  if (countyKeys.length === 0) return counties;
  if (countyKeys.length === 1 && countyKeys[0] === "__none__") return [];
  const allowed = new Set(countyKeys);
  return counties.filter((county) => allowed.has(countyKeyForZip3County(county)));
}

/** True when the county multiselect includes at least one county. */
export function hasZipCountyReportSelection(countyKeys: string[]): boolean {
  return !(countyKeys.length === 1 && countyKeys[0] === "__none__");
}

/** Narrow a report to selected counties (empty countyKeys = all). */
export function filterZipCountyReportByCounties(
  report: ZipCountyPlansReport,
  countyKeys: string[],
): ZipCountyPlansReport {
  if (countyKeys.length === 0) return report;
  if (countyKeys.length === 1 && countyKeys[0] === "__none__") {
    return { ...report, counties: [], totalPlans: 0 };
  }
  const counties = report.counties.filter((entry) =>
    multiSelectMatches(countyKeys, countyKeyForEntry(entry)),
  );
  return {
    ...report,
    counties,
    totalPlans: counties.reduce((sum, entry) => sum + entry.totalPlans, 0),
  };
}

/** Apply county multiselect + plan-type filter for inline view and PDF export. */
export function applyZipCountyReportViewFilters(
  report: ZipCountyPlansReport,
  filters: ZipCountyReportViewFilters,
): ZipCountyPlansReport {
  const byCounty = filterZipCountyReportByCounties(report, filters.countyKeys);
  const counties = byCounty.counties
    .map((entry) => filterZipCountyReportEntry(entry, filters.planFilter))
    .filter((entry): entry is ZipCountyPlansEntry => entry != null);
  return {
    ...byCounty,
    counties,
    totalPlans: counties.reduce((sum, entry) => sum + entry.totalPlans, 0),
  };
}

/** County dropdown options — only counties with plans matching the active type filter. */
export function zipCountyReportCountyOptions(
  report: ZipCountyPlansReport,
  planFilter: PlanFilterId = "all",
): { value: string; label: string }[] {
  return report.counties
    .filter((entry) => {
      if (planFilter === "all") return true;
      return filterZipCountyReportEntry(entry, planFilter) != null;
    })
    .map((entry) => ({
      value: countyKeyForEntry(entry),
      label: entry.countyLabel,
    }));
}

/** Drop county keys that no longer appear after a plan-type filter change. */
export function pruneZipCountySelection(countyKeys: string[], validKeys: string[]): string[] {
  if (countyKeys.length === 0 || countyKeys[0] === "__none__") return countyKeys;
  const valid = new Set(validKeys);
  const next = countyKeys.filter((key) => valid.has(key));
  if (next.length === 0) return [];
  return next;
}

/** Build a cascading county → plan-type report for a ZIP using the regional CMS catalog. */
export function buildZipCountyPlansReport(
  input: AreaPlanCatalogInput & {
    zipCode: string;
    inputMode?: ZipReportInputMode;
    counties?: Zip3County[];
  },
): ZipCountyPlansReport {
  const zipCode = normalizeZipCodeInput(input.zipCode);
  const detectedMode = zipReportInputMode(zipCode) ?? "zip5";
  // A complete 5-digit ZIP always uses zip5 semantics — never all prefix counties.
  const inputMode = detectedMode === "zip5" ? "zip5" : (input.inputMode ?? detectedMode);
  const zip3 = normalizeZip3Input(zipCode);
  const countyList =
    inputMode === "zip5"
      ? (input.counties ?? [])
      : (input.counties ?? countiesForZip3(zip3));

  const counties: ZipCountyPlansEntry[] = countyList.map((county) => {
    const plans = buildAreaPlanCatalog({
      year: input.year,
      zip3,
      county: county.county,
      medications: input.medications,
    });
    const groups = groupPlansByCategory(plans);
    return {
      county,
      countyLabel: formatCountyOptionLabel(county),
      groups,
      totalPlans: plans.length,
    };
  });

  return {
    zipCode,
    zip3,
    inputMode,
    counties,
    totalPlans: counties.reduce((sum, entry) => sum + entry.totalPlans, 0),
    generatedAt: new Date().toISOString(),
  };
}
