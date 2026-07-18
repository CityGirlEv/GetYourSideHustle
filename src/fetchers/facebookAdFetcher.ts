// src/fetchers/facebookAdFetcher.ts
import type { MedicareAd } from "../types/MedicareAd";
import { CONFIG } from "../lib/config";

const META_GRAPH_VERSION = "v20.0";
const META_AD_REACHED_COUNTRIES = '["US"]';

/** Medicare-focused keywords for Meta Ad Library keyword search. */
export const META_AD_LIBRARY_SEARCH_TERMS = [
  "medicare",
  "medicare advantage",
  "medicare supplement",
  "part b",
  "turning 65",
  "medigap",
] as const;

/** Ad types to try — Medicare ads often appear under financial products. */
export const META_AD_LIBRARY_AD_TYPES = [
  "FINANCIAL_PRODUCTS_AND_SERVICES_ADS",
  "ALL",
] as const;

export type MetaAdLibraryAdType = (typeof META_AD_LIBRARY_AD_TYPES)[number];

const META_AD_FIELDS = [
  "ad_creative_body",
  "ad_creative_link_caption",
  "ad_creative_link_description",
  "ad_creative_link_title",
  "page_id",
  "page_name",
  "ad_snapshot_url",
  "bylines",
  "publisher_platforms",
].join(",");

type MetaAdArchiveRecord = {
  page_id?: string;
  page_name?: string;
  ad_snapshot_url?: string;
  ad_creative_body?: string;
  ad_creative_link_title?: string;
  ad_creative_link_description?: string;
  ad_creative_link_caption?: string;
  bylines?: string;
};

type MetaGraphError = {
  message: string;
  code?: number;
  type?: string;
};

/** Repo-relative path to the Meta Ad Library setup guide (also in error messages). */
export const META_AD_LIBRARY_SETUP_DOC = "docs/META_AD_LIBRARY_TOKEN.md";

export function isMetaAdLibraryPermissionError(error: MetaGraphError): boolean {
  const message = error.message?.trim() ?? "";
  return (
    error.code === 10 ||
    (error.type === "OAuthException" && /does not have permission/i.test(message)) ||
    /does not have permission/i.test(message)
  );
}

export function isMetaAdLibraryTokenError(error: MetaGraphError): boolean {
  const message = error.message?.trim() ?? "";
  return error.code === 190 || /invalid.*token|expired/i.test(message);
}

export function formatMetaAdLibraryError(error: MetaGraphError): string {
  const message = error.message?.trim() || "Meta Ad Library request failed.";
  if (isMetaAdLibraryPermissionError(error)) {
    return `${message} — enable Ad Library API on your Meta Developer app and regenerate FACEBOOK_ACCESS_TOKEN with ads_read (see ${META_AD_LIBRARY_SETUP_DOC}).`;
  }
  if (isMetaAdLibraryTokenError(error)) {
    return `${message} — regenerate a long-lived FACEBOOK_ACCESS_TOKEN (see ${META_AD_LIBRARY_SETUP_DOC}).`;
  }
  return message;
}

export function buildMetaAdLibrarySearchUrl(
  token: string,
  limit: number,
  adType: MetaAdLibraryAdType,
  searchTerms = META_AD_LIBRARY_SEARCH_TERMS[0],
): string {
  const params = new URLSearchParams({
    access_token: token,
    search_terms: searchTerms,
    ad_reached_countries: META_AD_REACHED_COUNTRIES,
    ad_type: adType,
    fields: META_AD_FIELDS,
    limit: String(limit),
  });
  return `https://graph.facebook.com/${META_GRAPH_VERSION}/ads_archive?${params}`;
}

export function metaAdDedupeKey(ad: MetaAdArchiveRecord): string {
  const snapshot = ad.ad_snapshot_url?.trim();
  if (snapshot) return snapshot;
  const pageId = ad.page_id?.trim() ?? "";
  const body = (ad.ad_creative_body ?? "").trim().slice(0, 120);
  const title = (ad.ad_creative_link_title ?? "").trim();
  return `${pageId}|${title}|${body}`;
}

export function mapMetaAdToMedicareAd(ad: MetaAdArchiveRecord): MedicareAd {
  const pageId = ad.page_id?.trim() ?? "";
  const pageName = ad.page_name?.trim() || ad.bylines?.trim() || pageId || "Meta advertiser";
  const pageUrl = pageId ? `https://www.facebook.com/${pageId}` : "";
  const primaryText = (ad.ad_creative_body ?? "").trim();
  const headline = (ad.ad_creative_link_title ?? ad.ad_creative_link_caption ?? "").trim();
  const description = (ad.ad_creative_link_description ?? "").trim();

  return {
    companyName: pageName,
    websiteUrl: pageUrl,
    socialMedia: {
      facebook: pageUrl,
      tiktok: "",
      other: [],
    },
    adUrl: ad.ad_snapshot_url ?? "",
    primaryText,
    description,
    headline,
    hooks: [],
    painPoints: [],
    keywords: [],
    hashtags: [],
    reviewSnippets: [],
  };
}

async function queryMetaAdLibrary(
  token: string,
  limit: number,
  adType: MetaAdLibraryAdType,
  searchTerms: string,
): Promise<{ ads: MetaAdArchiveRecord[]; error?: MetaGraphError }> {
  const url = buildMetaAdLibrarySearchUrl(token, limit, adType, searchTerms);
  const resp = await fetch(url);
  const data = (await resp.json()) as { data?: MetaAdArchiveRecord[]; error?: MetaGraphError };

  if (data.error) {
    return { ads: [], error: data.error };
  }
  if (!resp.ok) {
    return {
      ads: [],
      error: { message: `Meta Ad Library HTTP ${resp.status}`, code: resp.status },
    };
  }
  return { ads: data.data ?? [] };
}

/**
 * Fetch Medicare-related ads from the Meta Ad Library (`/ads_archive`).
 * Runs keyword searches across Medicare terms, dedupes by snapshot URL, and stops at `limit`.
 * Requires FACEBOOK_ACCESS_TOKEN with ads_read on an app that has Ad Library API enabled.
 */
export async function fetchFacebookAds(limit: number): Promise<MedicareAd[]> {
  const token = CONFIG.facebookAccessToken.trim();
  if (!token) {
    throw new Error("FACEBOOK_ACCESS_TOKEN not configured — add token to load live Meta ads.");
  }

  const seen = new Set<string>();
  const collected: MedicareAd[] = [];
  let lastError: MetaGraphError | undefined;

  const addRecords = (records: MetaAdArchiveRecord[]): boolean => {
    for (const record of records) {
      const key = metaAdDedupeKey(record);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const mapped = mapMetaAdToMedicareAd(record);
      if (mapped.companyName.trim().length > 0) {
        collected.push(mapped);
      }
      if (collected.length >= limit) return true;
    }
    return collected.length >= limit;
  };

  for (const adType of META_AD_LIBRARY_AD_TYPES) {
    for (const searchTerms of META_AD_LIBRARY_SEARCH_TERMS) {
      const { ads, error } = await queryMetaAdLibrary(token, limit, adType, searchTerms);
      if (error) {
        lastError = error;
        if (isMetaAdLibraryPermissionError(error) || isMetaAdLibraryTokenError(error)) {
          throw new Error(formatMetaAdLibraryError(error));
        }
        continue;
      }
      if (addRecords(ads)) break;
    }
    if (collected.length >= limit) break;
  }

  if (collected.length === 0 && lastError) {
    throw new Error(formatMetaAdLibraryError(lastError));
  }

  return collected;
}
