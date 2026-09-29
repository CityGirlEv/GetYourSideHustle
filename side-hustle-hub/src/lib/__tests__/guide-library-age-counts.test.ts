import { describe, expect, it } from "vitest";
import { LAUNCH_GUIDES } from "../launch-guides";
import { SIDE_HUSTLES, hustleById, hustleCardPeek } from "../side-hustle-catalog";
import { guidesForAudience } from "../kids-guides";
import { orderedSeniorGuides, SENIOR_GUIDE_TEASERS } from "../seniors-content";
import { filterGuidesForViewer } from "../guide-catalog-state";
import type { HustleAgeGroup } from "../side-hustle-catalog";

/** Mirror FreeGuidesPage launchForAge + age pools (admin sees unpublished). */
function libraryPools() {
  const launchForAge = (age: HustleAgeGroup) => {
    const fromLaunch = LAUNCH_GUIDES.filter((g) => hustleById(g.id)?.audiences.includes(age));
    const seen = new Set(fromLaunch.map((g) => g.id));
    const extras = SIDE_HUSTLES.filter(
      (h) => h.audiences.includes(age) && !seen.has(h.id),
    ).map((h) => ({
      id: h.id,
      name: h.name,
      peek: hustleCardPeek(h),
    }));
    return [...fromLaunch, ...extras];
  };

  const kidsAll = guidesForAudience("kids");
  const juniorAll = guidesForAudience("junior");
  const seniorAll = orderedSeniorGuides(SENIOR_GUIDE_TEASERS);

  const kids = filterGuidesForViewer(
    (() => {
      const launch = launchForAge("kids").map((g) => ({ id: g.id }));
      const seen = new Set(launch.map((g) => g.id));
      return [...launch, ...kidsAll.filter((g) => !seen.has(g.id)).map((g) => ({ id: g.id }))];
    })(),
    {},
    { isAdmin: true },
  );
  const junior = filterGuidesForViewer(
    (() => {
      const launch = launchForAge("junior").map((g) => ({ id: g.id }));
      const seen = new Set(launch.map((g) => g.id));
      return [...launch, ...juniorAll.filter((g) => !seen.has(g.id)).map((g) => ({ id: g.id }))];
    })(),
    {},
    { isAdmin: true },
  );
  const adult = filterGuidesForViewer(launchForAge("adult").map((g) => ({ id: g.id })), {}, {
    isAdmin: true,
  });
  const senior = filterGuidesForViewer(
    (() => {
      const launchRows = launchForAge("senior").map((g) => ({ id: g.id }));
      const seen = new Set(launchRows.map((g) => g.id));
      const teasers = seniorAll.filter(
        (g) => g.status !== "coming_soon" && !(g.launchGuideId && seen.has(g.launchGuideId)),
      );
      return [...launchRows, ...teasers.map((g) => ({ id: g.id }))];
    })(),
    {},
    { isAdmin: true },
  );

  const unique = new Set<string>();
  for (const g of [...kids, ...junior, ...adult, ...senior]) unique.add(g.id);

  return {
    kids: kids.length,
    junior: junior.length,
    adult: adult.length,
    senior: senior.length,
    unique: unique.size,
    sumTabs: kids.length + junior.length + adult.length + senior.length,
  };
}

describe("Guide Library age-tab counts", () => {
  it("Adults ≈ launch set; Show All unique is larger than 57", () => {
    const c = libraryPools();
    // eslint-disable-next-line no-console
    console.log("library pools", c);
    expect(c.adult).toBeGreaterThanOrEqual(LAUNCH_GUIDES.length);
    expect(c.unique).toBeGreaterThan(57);
    // Summing Kids+Teens+Adults+Seniors double-counts shared ids — that is not the unique total.
    expect(c.sumTabs).toBeGreaterThan(c.unique);
  });
});
