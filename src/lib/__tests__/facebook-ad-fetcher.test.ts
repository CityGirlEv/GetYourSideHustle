import { describe, expect, it } from "vitest";
import {
  META_AD_LIBRARY_AD_TYPES,
  META_AD_LIBRARY_SEARCH_TERMS,
  META_AD_LIBRARY_SETUP_DOC,
  buildMetaAdLibrarySearchUrl,
  formatMetaAdLibraryError,
  isMetaAdLibraryPermissionError,
  mapMetaAdToMedicareAd,
  metaAdDedupeKey,
} from "@/fetchers/facebookAdFetcher";

describe("facebookAdFetcher", () => {
  it("builds Meta Ad Library URL with required ad_reached_countries and ad_type", () => {
    const url = buildMetaAdLibrarySearchUrl("test-token", 10, "ALL");
    expect(url).toContain("graph.facebook.com/v20.0/ads_archive");
    expect(url).toContain("search_terms=medicare");
    expect(url).toContain("ad_reached_countries=");
    expect(url).toContain("ad_type=ALL");
    expect(url).toContain("limit=10");
    expect(url).toContain("access_token=test-token");
  });

  it("supports custom Medicare keyword search terms", () => {
    const url = buildMetaAdLibrarySearchUrl("test-token", 5, "FINANCIAL_PRODUCTS_AND_SERVICES_ADS", "medigap");
    expect(url).toContain("search_terms=medigap");
    expect(url).toContain("ad_type=FINANCIAL_PRODUCTS_AND_SERVICES_ADS");
  });

  it("defines Medicare keyword list for multi-search", () => {
    expect(META_AD_LIBRARY_SEARCH_TERMS).toContain("medicare");
    expect(META_AD_LIBRARY_SEARCH_TERMS).toContain("medicare advantage");
    expect(META_AD_LIBRARY_SEARCH_TERMS).toContain("turning 65");
    expect(META_AD_LIBRARY_SEARCH_TERMS.length).toBeGreaterThanOrEqual(6);
  });

  it("tries financial products ad type before ALL", () => {
    expect(META_AD_LIBRARY_AD_TYPES[0]).toBe("FINANCIAL_PRODUCTS_AND_SERVICES_ADS");
    expect(META_AD_LIBRARY_AD_TYPES[1]).toBe("ALL");
  });

  it("dedupes Meta ads by snapshot URL when available", () => {
    const key = metaAdDedupeKey({
      ad_snapshot_url: "https://www.facebook.com/ads/archive/render_ad/?id=99",
      page_id: "1",
      ad_creative_body: "body",
    });
    expect(key).toContain("facebook.com/ads/archive");
  });

  it("maps Meta archive records to MedicareAd with page name and snapshot URL", () => {
    const ad = mapMetaAdToMedicareAd({
      page_id: "12345",
      page_name: "Medicare Example Co",
      ad_snapshot_url: "https://www.facebook.com/ads/archive/render_ad/?id=1",
      ad_creative_body: "Compare Medicare options in your area.",
      ad_creative_link_title: "Medicare clarity",
      ad_creative_link_description: "Educational comparison",
    });

    expect(ad.companyName).toBe("Medicare Example Co");
    expect(ad.websiteUrl).toBe("https://www.facebook.com/12345");
    expect(ad.adUrl).toContain("facebook.com/ads/archive");
    expect(ad.primaryText).toContain("Compare Medicare");
    expect(ad.headline).toBe("Medicare clarity");
    expect(ad.socialMedia.facebook).toBe("https://www.facebook.com/12345");
  });

  it("formats permission errors with setup guidance", () => {
    const err = {
      message: "Application does not have permission for this action",
      code: 10,
      type: "OAuthException",
    };
    const msg = formatMetaAdLibraryError(err);
    expect(msg).toMatch(/Ad Library API/i);
    expect(msg).toMatch(/ads_read/i);
    expect(msg).toContain(META_AD_LIBRARY_SETUP_DOC);
    expect(isMetaAdLibraryPermissionError(err)).toBe(true);
  });

  it("detects permission errors without OAuth code 10", () => {
    const err = {
      message: "Application does not have permission for this action",
      type: "OAuthException",
    };
    expect(isMetaAdLibraryPermissionError(err)).toBe(true);
  });
});
