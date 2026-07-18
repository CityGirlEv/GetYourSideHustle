// src/fetchers/kalodataAdFetcher.ts
import type { MedicareAd } from "../types/MedicareAd";
import { CONFIG } from "../lib/config";

/** Marker in socialMedia.other so scouting can tag Kalodata-sourced ads. */
export const KALODATA_SOURCE_MARKER = "source:kalodata";

/** Repo-relative path to Kalodata Enterprise API setup notes. */
export const KALODATA_SETUP_DOC = "docs/KALODATA_API.md";

/** Medicare keywords sent to Kalodata video/ad search when Enterprise API is configured. */
export const KALODATA_MEDICARE_SEARCH_TERMS = [
  "medicare",
  "medicare advantage",
  "medicare supplement",
  "medigap",
  "turning 65",
  "part b",
] as const;

type KalodataVideoRecord = {
  video_id?: string;
  id?: string;
  title?: string;
  description?: string;
  caption?: string;
  creator_name?: string;
  author_name?: string;
  shop_name?: string;
  video_url?: string;
  tiktok_url?: string;
  url?: string;
};

type KalodataSearchResponse = {
  data?: KalodataVideoRecord[];
  videos?: KalodataVideoRecord[];
  results?: KalodataVideoRecord[];
  error?: { message?: string; code?: string | number };
  message?: string;
};

export function isKalodataConfigured(): boolean {
  return Boolean(CONFIG.kalodataApiKey.trim() && CONFIG.kalodataApiBaseUrl.trim());
}

export function kalodataVideoDedupeKey(record: KalodataVideoRecord): string {
  const id = record.video_id?.trim() || record.id?.trim();
  if (id) return `kalodata:${id}`;
  const url = (record.tiktok_url ?? record.video_url ?? record.url ?? "").trim();
  if (url) return url;
  const title = (record.title ?? record.caption ?? "").trim().slice(0, 80);
  const creator = (record.shop_name ?? record.creator_name ?? record.author_name ?? "").trim();
  return `${creator}|${title}`;
}

export function mapKalodataRecordToMedicareAd(record: KalodataVideoRecord): MedicareAd {
  const videoUrl = (record.tiktok_url ?? record.video_url ?? record.url ?? "").trim();
  const companyName =
    record.shop_name?.trim() ||
    record.creator_name?.trim() ||
    record.author_name?.trim() ||
    "Kalodata creator";
  const primaryText = (record.description ?? record.caption ?? "").trim();
  const headline = (record.title ?? record.caption ?? primaryText).trim().slice(0, 120);

  return {
    companyName,
    websiteUrl: videoUrl,
    socialMedia: {
      facebook: "",
      tiktok: videoUrl,
      other: [KALODATA_SOURCE_MARKER],
    },
    adUrl: videoUrl,
    primaryText,
    description: primaryText,
    headline,
    hooks: [],
    painPoints: [],
    keywords: [],
    hashtags: [],
    reviewSnippets: [],
  };
}

function extractKalodataRecords(payload: KalodataSearchResponse): KalodataVideoRecord[] {
  return payload.data ?? payload.videos ?? payload.results ?? [];
}

function formatKalodataError(status: number, payload: KalodataSearchResponse): string {
  const detail =
    payload.error?.message?.trim() ||
    payload.message?.trim() ||
    `Kalodata API HTTP ${status}`;
  return `${detail} — verify KALODATA_API_KEY and KALODATA_API_BASE_URL (see ${KALODATA_SETUP_DOC}).`;
}

/**
 * Search Kalodata for Medicare-related TikTok video ads.
 * Requires Enterprise custom API credentials from Kalodata sales — no public self-service API.
 */
export async function fetchKalodataAds(limit: number): Promise<MedicareAd[]> {
  const apiKey = CONFIG.kalodataApiKey.trim();
  const baseUrl = CONFIG.kalodataApiBaseUrl.trim().replace(/\/$/, "");

  if (!apiKey || !baseUrl) {
    throw new Error(
      `Kalodata API not configured — Enterprise custom API required (see ${KALODATA_SETUP_DOC}).`,
    );
  }

  const seen = new Set<string>();
  const collected: MedicareAd[] = [];
  let lastError: string | undefined;

  for (const keyword of KALODATA_MEDICARE_SEARCH_TERMS) {
    if (collected.length >= limit) break;

    const searchUrl = `${baseUrl}/video/search`;
    let resp: Response;
    try {
      resp = await fetch(searchUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          keyword,
          keywords: [keyword],
          query: keyword,
          limit: Math.min(limit - collected.length, 25),
        }),
      });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      continue;
    }

    let payload: KalodataSearchResponse;
    try {
      payload = (await resp.json()) as KalodataSearchResponse;
    } catch {
      lastError = formatKalodataError(resp.status, { message: "Invalid JSON response" });
      continue;
    }

    if (!resp.ok || payload.error) {
      lastError = formatKalodataError(resp.status, payload);
      continue;
    }

    for (const record of extractKalodataRecords(payload)) {
      const key = kalodataVideoDedupeKey(record);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const mapped = mapKalodataRecordToMedicareAd(record);
      if (!mapped.adUrl && !mapped.primaryText && !mapped.headline) continue;
      collected.push(mapped);
      if (collected.length >= limit) break;
    }
  }

  if (collected.length === 0 && lastError) {
    throw new Error(lastError);
  }

  return collected;
}
