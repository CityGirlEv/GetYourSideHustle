// src/fetchers/facebookAdFetcher.ts
import type { MedicareAd } from "../types/MedicareAd";
import { CONFIG } from "../lib/config";

/**
 * Fetch top Medicare related ads from Facebook Graph API.
 * Uses the access token configured in `CONFIG.facebookAccessToken`.
 * Returns an array of `MedicareAd` objects.
 */
export async function fetchFacebookAds(limit: number): Promise<MedicareAd[]> {
  const token = CONFIG.facebookAccessToken;
  if (!token) {
    console.warn("Facebook access token not configured – returning empty list.");
    return [];
  }

  const fields = [
    "ad_creative_body",
    "ad_creative_link_caption",
    "ad_creative_link_description",
    "ad_creative_link_title",
    "page_id",
    "ad_snapshot_url",
    "primary_text",
    "description",
    "headline",
    "call_to_action_type",
    "effective_status",
  ].join(",");

  const url = `https://graph.facebook.com/v20.0/ads_archive?access_token=${token}` +
    `&search_terms=medicare&fields=${encodeURIComponent(fields)}&limit=${limit}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("Failed to fetch Facebook ads:", resp.status, resp.statusText);
      return [];
    }
    const data = await resp.json();
    const ads = (data?.data ?? []) as any[];
    return ads.map((ad) => {
      const pageUrl = `https://www.facebook.com/${ad.page_id}`;
      return {
        companyName: ad.page_id,
        websiteUrl: pageUrl,
        socialMedia: {
          facebook: pageUrl,
          tiktok: "",
          other: [],
        },
        adUrl: ad.ad_snapshot_url ?? "",
        primaryText: ad.primary_text ?? "",
        description: ad.ad_creative_link_description ?? "",
        headline: ad.ad_creative_link_title ?? "",
        hooks: [],
        painPoints: [],
        keywords: [],
        hashtags: [],
        reviewSnippets: [],
      } as MedicareAd;
    });
  } catch (e) {
    console.error("Error fetching Facebook ads", e);
    return [];
  }
}
