import manifest from "@/data/cms-landscape/2026/manifest.json";
import type { CmsLandscapePlanRecord } from "@/lib/cms-landscape-types";
import { medicationCatalogKey } from "@/lib/plan-catalog-cache";
import { GUIDELINES, INSULIN_CAP_MONTHLY, type Medication, type Year } from "@/lib/medicare-math";
import type { PlanDetail } from "@/lib/plan-details";
import { countiesForZip3, normalizeCountyName } from "@/lib/zip3-county-lookup";

const DATA_BASE = "/data/cms-landscape/2026";
const CMS_LANDSCAPE_STATE_KEY = "__mypartbCmsLandscapeState__";

type CmsLandscapeState = {
  CMS_PLANS: Record<string, CmsLandscapePlanRecord>;
  COUNTY_INDEX: Record<string, string[]>;
  loadPromise: Promise<void> | null;
  loaded: boolean;
  loading: boolean;
  lastError: Error | null;
};

function landscapeState(): CmsLandscapeState {
  const root = globalThis as typeof globalThis & {
    [CMS_LANDSCAPE_STATE_KEY]?: CmsLandscapeState;
  };
  if (!root[CMS_LANDSCAPE_STATE_KEY]) {
    root[CMS_LANDSCAPE_STATE_KEY] = {
      CMS_PLANS: {},
      COUNTY_INDEX: {},
      loadPromise: null,
      loaded: false,
      loading: false,
      lastError: null,
    };
  }
  return root[CMS_LANDSCAPE_STATE_KEY];
}

const loadListeners = new Set<() => void>();

function notifyLoadListeners(): void {
  loadListeners.forEach((listener) => listener());
}

/** Subscribe to CMS landscape fetch lifecycle (client hydration). */
export function subscribeCmsLandscapeLoadState(listener: () => void): () => void {
  loadListeners.add(listener);
  return () => loadListeners.delete(listener);
}

export function isCmsLandscapeLoading(): boolean {
  return landscapeState().loading;
}

export function getCmsLandscapeLoadError(): Error | null {
  return landscapeState().lastError;
}

export const CMS_LANDSCAPE_MANIFEST = manifest;

/** User-facing note for when the nationwide CMS landscape JSON was last ingested. */
export function formatCmsLandscapeLastLoadedNote(
  ingestedAt: string = manifest.ingestedAt,
  locale?: string,
): string {
  const parsed = new Date(ingestedAt);
  if (Number.isNaN(parsed.getTime())) {
    return "CMS Medicare Advantage & Part D landscape load date unavailable.";
  }
  const when = parsed.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `CMS Medicare Advantage & Part D landscape last loaded ${when}.`;
}

export type LandscapeLoadOptions = {
  /** Request origin for SSR/worker fetches (e.g. https://mypartb.com). */
  origin?: string;
  /** Cloudflare ASSETS binding — preferred on Worker SSR. */
  assets?: { fetch: typeof fetch };
};

function resolveDataUrl(path: string, origin?: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return base ? new URL(path, base).toString() : path;
}

async function fetchLandscapeJson<T>(
  path: string,
  options?: LandscapeLoadOptions,
  attempt = 1,
): Promise<T> {
  const url = resolveDataUrl(path, options?.origin);
  try {
    if (options?.assets) {
      const res = await options.assets.fetch(url);
      if (!res.ok) throw new Error(`CMS landscape fetch failed (${res.status}): ${path}`);
      return res.json() as Promise<T>;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CMS landscape fetch failed (${res.status}): ${path}`);
    return res.json() as Promise<T>;
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 400));
      return fetchLandscapeJson<T>(path, options, attempt + 1);
    }
    throw err;
  }
}

/** Load nationwide CMS landscape JSON at runtime (not bundled in worker/client JS). */
export async function ensureCmsLandscapeLoaded(options?: LandscapeLoadOptions): Promise<void> {
  const state = landscapeState();
  if (state.loaded && Object.keys(state.CMS_PLANS).length > 0) return;
  if (state.loaded && Object.keys(state.CMS_PLANS).length === 0) {
    state.loaded = false;
  }
  if (!state.loadPromise) {
    state.loading = true;
    state.lastError = null;
    notifyLoadListeners();
    state.loadPromise = (async () => {
      if (typeof window !== "undefined") {
        const { readCmsLandscapeClientCache } = await import("@/lib/cms-landscape-client-cache");
        const cached = await readCmsLandscapeClientCache();
        if (cached) {
          state.CMS_PLANS = cached.plans;
          state.COUNTY_INDEX = cached.countyIndex;
          state.loaded = true;
          return;
        }
      }

      const [plans, index] = await Promise.all([
        fetchLandscapeJson<Record<string, CmsLandscapePlanRecord>>(
          `${DATA_BASE}/plans.json`,
          options,
        ),
        fetchLandscapeJson<Record<string, string[]>>(`${DATA_BASE}/county-index.json`, options),
      ]);
      if (!plans || Object.keys(plans).length === 0) {
        throw new Error(`CMS landscape plans.json is empty: ${DATA_BASE}/plans.json`);
      }
      state.CMS_PLANS = plans;
      state.COUNTY_INDEX = index;
      state.loaded = true;

      if (typeof window !== "undefined") {
        const { writeCmsLandscapeClientCache } = await import("@/lib/cms-landscape-client-cache");
        writeCmsLandscapeClientCache(plans, index);
      }
    })()
      .catch((err) => {
        state.loadPromise = null;
        state.lastError = err instanceof Error ? err : new Error(String(err));
        throw err;
      })
      .finally(() => {
        state.loading = false;
        notifyLoadListeners();
      });
  }
  await state.loadPromise;
}

/** Kick off client-side CMS landscape fetch as early as possible (survives HMR via globalThis). */
if (typeof window !== "undefined" && !import.meta.env.VITEST) {
  void ensureCmsLandscapeLoaded().catch((err) => {
    console.error("[cms-landscape] client preload failed:", err);
  });
}

if (import.meta.hot) {
  import.meta.hot.accept();
}

/** Hydrate in-memory CMS landscape (server disk load or Vitest setup). */
export function hydrateCmsLandscapeState(
  plans: Record<string, CmsLandscapePlanRecord>,
  countyIndex: Record<string, string[]>,
): void {
  const state = landscapeState();
  state.CMS_PLANS = plans;
  state.COUNTY_INDEX = countyIndex;
  state.loaded = true;
  state.loadPromise = Promise.resolve();
}

/** Vitest-only: hydrate sync catalog without fetch. */
export function __hydrateCmsLandscapeForTests(data: {
  plans: Record<string, CmsLandscapePlanRecord>;
  countyIndex: Record<string, string[]>;
}): void {
  hydrateCmsLandscapeState(data.plans, data.countyIndex);
}

/** Vitest-only: clear in-memory landscape (simulate client before fetch completes). */
export function __clearCmsLandscapeForTests(): void {
  const state = landscapeState();
  state.CMS_PLANS = {};
  state.COUNTY_INDEX = {};
  state.loaded = false;
  state.loadPromise = null;
  state.loading = false;
  state.lastError = null;
}

export function cmsLandscapeIsLoaded(): boolean {
  const state = landscapeState();
  return state.loaded && Object.keys(state.CMS_PLANS).length > 0;
}

/** Require nationwide CMS landscape JSON — no synthetic catalog fallback. */
export function requireCmsLandscapeLoaded(): void {
  if (!cmsLandscapeIsLoaded()) {
    throw new Error(
      "CMS landscape plan data is not loaded. Restart the dev server (npm run dev). If files are missing, run: npm run ingest:cms-landscape",
    );
  }
}

function countyKey(stateAbbr: string, countyName: string): string {
  return `${stateAbbr}:${normalizeCountyName(countyName)}`;
}

function starLabel(rating: number | null | undefined, fallback = "Not rated"): string {
  if (rating == null || Number.isNaN(rating)) return fallback;
  return `${rating.toFixed(1)}★`;
}

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function annualDrugEstimate(medications: Medication[], cap: number): number {
  return Math.min(
    medications.reduce((sum, med) => sum + (med.estimated_monthly_retail ?? 0) * 12, 0),
    cap,
  );
}

function planMonthlyPremium(record: CmsLandscapePlanRecord): number {
  if (record.consolidatedPremium != null && record.consolidatedPremium >= 0) {
    return Math.round(record.consolidatedPremium);
  }
  const partC = record.partCPremium ?? 0;
  const partD = record.partDTotalPremium ?? 0;
  const sum = partC + partD;
  if (sum > 0) return Math.round(sum);
  if (record.partCPremium != null) return Math.max(0, Math.round(record.partCPremium));
  if (record.partDTotalPremium != null) return Math.max(0, Math.round(record.partDTotalPremium));
  return 0;
}

function cmsPlanTypeLabel(record: CmsLandscapePlanRecord): string {
  if (/^PDP$/i.test(record.planType) || record.contractCategory === "PDP") {
    return "Medicare Part D (PDP)";
  }
  if (record.snpIndicator && record.snpType) {
    return `Medicare Advantage (${record.planType})`;
  }
  return `Medicare Advantage (${record.planType})`;
}

function cmsNetworkLabel(record: CmsLandscapePlanRecord): string {
  if (/PPO/i.test(record.planType)) return "PPO — in/out-of-network";
  if (/HMO-POS/i.test(record.planType)) return "HMO-POS — point of service";
  if (/HMO/i.test(record.planType)) return "HMO — in-network primary care";
  if (/PFFS/i.test(record.planType)) return "PFFS — private fee-for-service";
  if (/PDP/i.test(record.planType)) return "Standalone prescription drug plan";
  return record.planType;
}

/** Modeled Part D tier copays for CMS landscape plans (formulary-specific copays are not in PBP extract). */
export function cmsModeledRxTierCopays(record: CmsLandscapePlanRecord): {
  rxTier1: string;
  rxTier2: string;
  rxTier3: string;
} {
  const isPdp = /^PDP$/i.test(record.planType) || record.contractCategory === "PDP";
  const star =
    record.partDStarRating ?? record.overallStarRating ?? record.partCStarRating ?? 3.5;
  const starBucket = star >= 4.5 ? 2 : star >= 4 ? 1 : 0;

  if (isPdp) {
    const tiers = [
      { rxTier1: "$0–$5", rxTier2: "$12", rxTier3: "$47" },
      { rxTier1: "$0–$4", rxTier2: "$10", rxTier3: "$45" },
      { rxTier1: "$0–$3", rxTier2: "$8", rxTier3: "$42" },
    ] as const;
    return tiers[starBucket]!;
  }

  const isPpo = /PPO/i.test(record.planType);
  const tiers = [
    { rxTier1: isPpo ? "$5" : "$0–$5", rxTier2: "$12", rxTier3: "$48" },
    { rxTier1: isPpo ? "$2" : "$0", rxTier2: "$10", rxTier3: "$47" },
    { rxTier1: isPpo ? "$0" : "$0", rxTier2: "$8", rxTier3: "$45" },
  ] as const;
  return tiers[starBucket]!;
}

export function cmsLandscapePlanToDetail(
  record: CmsLandscapePlanRecord,
  year: Year,
  medications: Medication[],
): PlanDetail {
  const g = GUIDELINES[year];
  const partBMo = g.partBPremiumMonthly;
  const isPdp = /^PDP$/i.test(record.planType) || record.contractCategory === "PDP";
  const planPrem = isPdp ? planMonthlyPremium(record) : Math.max(0, planMonthlyPremium(record));
  const monthly = isPdp ? planPrem : partBMo + planPrem;
  const annualDrugEst = annualDrugEstimate(medications, g.partDOOPCap);
  const moop =
    record.inNetworkMoop != null
      ? `${formatUsd(record.inNetworkMoop)} in-network MOOP`
      : "See plan document";

  const stars =
    record.overallStarRating != null
      ? starLabel(record.overallStarRating)
      : record.partCStarRating != null
        ? starLabel(record.partCStarRating)
        : record.partDStarRating != null
          ? starLabel(record.partDStarRating)
          : "Not rated";

  const contractLabel = `${record.contractId}-${record.planId}`;
  const rxTiers = cmsModeledRxTierCopays(record);

  return {
    rank: 0,
    carrier: record.marketingName || record.parentOrganization,
    plan: `${record.planName} (${contractLabel})`,
    planType: cmsPlanTypeLabel(record),
    network: cmsNetworkLabel(record),
    premiumPartB: isPdp ? 0 : partBMo,
    premiumPlan: planPrem,
    premiumRx: 0,
    premiumDental: 0,
    premiumVision: 0,
    premiumExtras: 0,
    monthly,
    annual: Math.round(monthly * 12 + annualDrugEst + (isPdp ? 0 : 800)),
    deductibleMed: isPdp ? 0 : 0,
    deductibleRx: record.partDDeductible ?? 0,
    pcpCopay: isPdp ? "N/A" : "See plan summary",
    specCopay: isPdp ? "N/A" : "See plan summary",
    hospCopay: isPdp ? "N/A" : "See plan summary",
    erCopay: isPdp ? "N/A" : "See plan summary",
    moop,
    rxTier1: rxTiers.rxTier1,
    rxTier2: rxTiers.rxTier2,
    rxTier3: rxTiers.rxTier3,
    rxOOPCap: record.partOopThreshold ?? g.partDOOPCap,
    insulinCap: INSULIN_CAP_MONTHLY,
    dentalBenefit: isPdp ? "Not included" : "See plan summary",
    visionBenefit: isPdp ? "Not included" : "See plan summary",
    hearingBenefit: isPdp ? "Not included" : "See plan summary",
    otcBenefit: record.snpIndicator ? "May include OTC — verify eligibility" : "See plan summary",
    stars,
    amBest: "CMS landscape",
    extras: record.snpIndicator
      ? `${record.snpType} SNP — verify eligibility (CMS ${contractLabel})`
      : `CMS landscape ${contractLabel}`,
  };
}

function planIdsForCountyBucket(bucket: string | undefined): string[] {
  return bucket ? (landscapeState().COUNTY_INDEX[bucket] ?? []) : [];
}

/** Plan IDs available in a state+county from CMS landscape (includes statewide PDP bucket). */
export function cmsLandscapePlanIdsForCounty(stateAbbr: string, countyName: string): string[] {
  const keys = [countyKey(stateAbbr, countyName), `${stateAbbr}:__statewide__`];
  const ids = new Set<string>();
  for (const key of keys) {
    for (const id of planIdsForCountyBucket(key)) ids.add(id);
  }
  return [...ids];
}

/** Union of CMS plan IDs across all counties in a ZIP-3 prefix (optional parish filter). */
export function cmsLandscapePlanIdsForZip3(zip3: string, county?: string): string[] {
  const counties = countiesForZip3(zip3);
  if (!counties.length) return [];

  if (county?.trim()) {
    const withoutState = county.replace(/,\s*[A-Z]{2}\s*$/i, "").trim();
    const match = counties.find(
      (c) => normalizeCountyName(c.county) === normalizeCountyName(withoutState),
    );
    if (!match) return [];
    return cmsLandscapePlanIdsForCounty(match.stateCode, match.county);
  }

  const ids = new Set<string>();
  for (const c of counties) {
    for (const id of cmsLandscapePlanIdsForCounty(c.stateCode, c.county)) ids.add(id);
  }
  return [...ids];
}

const nationalPlansCache = new Map<string, PlanDetail[]>();
const zipScopedPlansCache = new Map<string, PlanDetail[]>();

export function cmsLandscapePlansForZip3(
  zip3: string,
  year: Year,
  medications: Medication[],
  county?: string,
): PlanDetail[] {
  const cacheKey = `${year}|${zip3}|${county ?? ""}|${medicationCatalogKey(medications)}`;
  const cached = zipScopedPlansCache.get(cacheKey);
  if (cached) return cached;

  const ids = cmsLandscapePlanIdsForZip3(zip3, county);
  const plans = ids
    .map((id) => landscapeState().CMS_PLANS[id])
    .filter((p): p is CmsLandscapePlanRecord => Boolean(p))
    .map((p) => cmsLandscapePlanToDetail(p, year, medications));
  zipScopedPlansCache.set(cacheKey, plans);
  return plans;
}

/** Every unique CMS MA / Part D plan nationally (deduped by landscape ID). */
export function cmsLandscapeNationalPlans(year: Year, medications: Medication[]): PlanDetail[] {
  const cacheKey = `${year}|${medicationCatalogKey(medications)}`;
  const cached = nationalPlansCache.get(cacheKey);
  if (cached) return cached;

  const plans = Object.values(landscapeState().CMS_PLANS).map((p) =>
    cmsLandscapePlanToDetail(p, year, medications),
  );
  nationalPlansCache.set(cacheKey, plans);
  return plans;
}
