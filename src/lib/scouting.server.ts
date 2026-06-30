import { CONFIG } from "@/lib/config";
import { buildScoutingReport } from "@/lib/scouting-research";
import type { MedicareAd } from "@/types/MedicareAd";
import type { ScoutingReport, ScoutingSourceId, ScoutingSourceStatus } from "@/types/scouting-report";

const SOURCE_LABELS: Record<ScoutingSourceId, string> = {
  facebook: "Meta Ad Library (Facebook)",
  tiktok: "TikTok discover search",
  web: "Curated Medicare competitor pages",
};

async function safeFetch<T>(label: string, fn: () => Promise<T[]>): Promise<{ items: T[]; error?: string }> {
  try {
    return { items: await fn() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[scouting] ${label} failed`, error);
    return { items: [], error: message };
  }
}

export async function fetchScoutingSource(source: ScoutingSourceId): Promise<{
  ads: MedicareAd[];
  status: ScoutingSourceStatus;
}> {
  const { defaultAdsPerSet } = CONFIG;
  const label = SOURCE_LABELS[source];

  if (source === "facebook") {
    const { fetchFacebookAds } = await import("@/fetchers/facebookAdFetcher");
    const { items, error } = await safeFetch("facebook", () => fetchFacebookAds(defaultAdsPerSet));
    if (!CONFIG.facebookAccessToken) {
      return {
        ads: [],
        status: {
          id: source,
          label,
          status: "skipped",
          message: "FACEBOOK_ACCESS_TOKEN not configured — add token to load live Meta ads.",
          adCount: 0,
        },
      };
    }
    return {
      ads: items,
      status: {
        id: source,
        label,
        status: error ? "error" : "done",
        message: error ?? `Loaded ${items.length} ads from Meta Ad Library.`,
        adCount: items.length,
      },
    };
  }

  if (source === "tiktok") {
    const { fetchTikTokAds } = await import("@/fetchers/tiktokAdFetcher");
    const { items, error } = await safeFetch("tiktok", () => fetchTikTokAds(defaultAdsPerSet));
    return {
      ads: items,
      status: {
        id: source,
        label,
        status: error ? "error" : "done",
        message:
          error ??
          (items.length
            ? `Loaded ${items.length} TikTok posts matching medicare.`
            : "No TikTok results returned (site may block headless browsers)."),
        adCount: items.length,
      },
    };
  }

  const { fetchWebAds } = await import("@/fetchers/webAdScraper");
  const { items, error } = await safeFetch("web", () => fetchWebAds(defaultAdsPerSet));
  return {
    ads: items,
    status: {
      id: source,
      label,
      status: error ? "error" : "done",
      message:
        error ??
        `Loaded ${items.length} curated competitor landing pages (Google scrape disabled to avoid CAPTCHA).`,
      adCount: items.length,
    },
  };
}

/** Load all scouting sources sequentially and build the research report. */
export async function loadScoutingData(): Promise<{
  report: ScoutingReport;
  sources: ScoutingSourceStatus[];
}> {
  const sources: ScoutingSourceId[] = ["facebook", "tiktok", "web"];
  const ads: MedicareAd[] = [];
  const statuses: ScoutingSourceStatus[] = [];
  const warnings: string[] = [
    "Google search scraping is disabled — it triggers CAPTCHA pages and unusable links. Use Meta Ad Library token + curated competitors instead.",
  ];

  for (const source of sources) {
    const result = await fetchScoutingSource(source);
    ads.push(...result.ads);
    statuses.push(result.status);
    if (result.status.status === "error" && result.status.message) {
      warnings.push(`${SOURCE_LABELS[source]}: ${result.status.message}`);
    }
  }

  const maxAds = CONFIG.defaultAdSetCount * CONFIG.defaultAdsPerSet;
  const report = buildScoutingReport(ads.slice(0, maxAds), warnings);
  return { report, sources: statuses };
}
