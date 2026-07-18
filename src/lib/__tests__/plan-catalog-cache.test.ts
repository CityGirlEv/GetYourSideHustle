import { describe, expect, it } from "vitest";
import { isCmsLandscapeClientCacheValid } from "@/lib/cms-landscape-client-cache";
import manifest from "@/data/cms-landscape/2026/manifest.json";
import {
  areaCatalogCacheKey,
  fullCatalogCacheKey,
  getCachedFullCatalog,
  isNationwidePlanCatalogWarm,
  medicationCatalogKey,
  setCachedFullCatalog,
  __clearPlanCatalogCacheForTests,
} from "@/lib/plan-catalog-cache";
import { fullCatalogPlanDetails } from "@/lib/plan-details";

describe("isCmsLandscapeClientCacheValid", () => {
  it("accepts a bundle cached today with matching ingest timestamp", () => {
    expect(
      isCmsLandscapeClientCacheValid({
        cachedAt: new Date().toISOString(),
        ingestedAt: manifest.ingestedAt,
        contractYear: manifest.contractYear,
      }),
    ).toBe(true);
  });

  it("rejects stale calendar-day bundles", () => {
    expect(
      isCmsLandscapeClientCacheValid({
        cachedAt: "2020-01-01T12:00:00.000Z",
        ingestedAt: manifest.ingestedAt,
        contractYear: manifest.contractYear,
      }),
    ).toBe(false);
  });

  it("rejects bundles from a prior CMS ingest", () => {
    expect(
      isCmsLandscapeClientCacheValid({
        cachedAt: new Date().toISOString(),
        ingestedAt: "2020-01-01T00:00:00.000Z",
        contractYear: manifest.contractYear,
      }),
    ).toBe(false);
  });
});

describe("plan catalog memoization", () => {
  it("builds stable medication keys", () => {
    expect(medicationCatalogKey([])).toBe("none");
    expect(
      medicationCatalogKey([
        { id: "b", estimated_monthly_retail: 10 },
        { id: "a", estimated_monthly_retail: 5 },
      ]),
    ).toBe("a|5;b|10");
  });

  it("reuses full national catalog for the same inputs", () => {
    __clearPlanCatalogCacheForTests();
    const key = fullCatalogCacheKey(2026, []);
    expect(getCachedFullCatalog(key)).toBeUndefined();

    const first = fullCatalogPlanDetails({ year: 2026, medications: [] });
    setCachedFullCatalog(key, first);
    const second = fullCatalogPlanDetails({ year: 2026, medications: [] });
    expect(second).toBe(first);
  });

  it("detects warm nationwide catalog after first build", () => {
    __clearPlanCatalogCacheForTests();
    const key = fullCatalogCacheKey(2026, []);
    expect(isNationwidePlanCatalogWarm(2026, [])).toBe(false);
    setCachedFullCatalog(key, []);
    expect(isNationwidePlanCatalogWarm(2026, [])).toBe(true);
  });

  it("uses distinct area cache keys per ZIP/county", () => {
    expect(areaCatalogCacheKey(2026, "705", "Evangeline Parish, LA", [])).not.toBe(
      areaCatalogCacheKey(2026, "706", "Evangeline Parish, LA", []),
    );
  });
});
