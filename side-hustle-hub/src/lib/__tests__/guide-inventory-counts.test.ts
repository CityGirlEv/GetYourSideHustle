import { describe, expect, it } from "vitest";
import { LAUNCH_GUIDES } from "../launch-guides";
import { SIDE_HUSTLES } from "../side-hustle-catalog";
import { KIDS_GUIDES } from "../kids-guides";
import { SENIOR_GUIDE_TEASERS } from "../seniors-content";
import { allCatalogGuideIds } from "../guide-catalog-state";
import { GUIDE_REVIEW_CATALOG } from "../gysh-guide-review-cases";
import { uniqueGuideLibraryCount } from "../guide-library-pool";

describe("guide inventory counts", () => {
  it("reports launch vs full unique inventory sizes", () => {
    const ids = new Set<string>();
    for (const g of LAUNCH_GUIDES) ids.add(g.id);
    for (const h of SIDE_HUSTLES) ids.add(h.id);
    for (const g of KIDS_GUIDES) ids.add(g.id);
    for (const g of SENIOR_GUIDE_TEASERS) ids.add(g.id);

    const summary = {
      launch: LAUNCH_GUIDES.length,
      sideHustles: SIDE_HUSTLES.length,
      kids: KIDS_GUIDES.length,
      seniorTeasers: SENIOR_GUIDE_TEASERS.length,
      guideReviewCatalog: GUIDE_REVIEW_CATALOG.length,
      uniqueUnion: ids.size,
    };
    // eslint-disable-next-line no-console
    console.log("guide inventory", summary);

    expect(summary.launch).toBeGreaterThan(50);
    expect(summary.launch).toBeLessThan(70);
    expect(summary.sideHustles).toBeGreaterThan(summary.launch);
    expect(summary.uniqueUnion).toBeGreaterThanOrEqual(summary.sideHustles);
    expect(summary.guideReviewCatalog).toBe(uniqueGuideLibraryCount());
    expect(summary.guideReviewCatalog).toBeGreaterThan(summary.launch);
    expect(allCatalogGuideIds().length).toBe(summary.sideHustles);
  });
});
