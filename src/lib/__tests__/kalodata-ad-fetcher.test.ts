import { describe, expect, it } from "vitest";
import {
  KALODATA_MEDICARE_SEARCH_TERMS,
  KALODATA_SETUP_DOC,
  KALODATA_SOURCE_MARKER,
  kalodataVideoDedupeKey,
  mapKalodataRecordToMedicareAd,
} from "@/fetchers/kalodataAdFetcher";

describe("kalodataAdFetcher", () => {
  it("defines Medicare keyword list for Kalodata search", () => {
    expect(KALODATA_MEDICARE_SEARCH_TERMS).toContain("medicare");
    expect(KALODATA_MEDICARE_SEARCH_TERMS).toContain("medigap");
    expect(KALODATA_MEDICARE_SEARCH_TERMS.length).toBeGreaterThanOrEqual(5);
  });

  it("maps Kalodata video records to MedicareAd with source marker", () => {
    const ad = mapKalodataRecordToMedicareAd({
      video_id: "vid-1",
      shop_name: "Medicare Tips Shop",
      title: "Turning 65 checklist",
      description: "Compare Medicare Advantage and Medigap.",
      tiktok_url: "https://www.tiktok.com/@shop/video/123",
    });

    expect(ad.companyName).toBe("Medicare Tips Shop");
    expect(ad.headline).toBe("Turning 65 checklist");
    expect(ad.adUrl).toContain("tiktok.com");
    expect(ad.socialMedia.tiktok).toContain("tiktok.com");
    expect(ad.socialMedia.other).toContain(KALODATA_SOURCE_MARKER);
  });

  it("dedupes Kalodata videos by video_id", () => {
    const key = kalodataVideoDedupeKey({ video_id: "abc123", title: "Medicare ad" });
    expect(key).toBe("kalodata:abc123");
  });

  it("references setup doc for Enterprise API limitation", () => {
    expect(KALODATA_SETUP_DOC).toBe("docs/KALODATA_API.md");
  });
});
