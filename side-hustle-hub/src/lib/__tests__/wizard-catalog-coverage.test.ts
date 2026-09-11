import { describe, expect, it } from "vitest";
import {
  SIDE_HUSTLES,
  hustlesForAudience,
  wizardPoolForMembership,
} from "../side-hustle-catalog";
import { getAdultWizardProfile } from "../hustle-wizard-profiles";
import { kidsWizardPoolForMode, allKidsJuniorCatalogIds } from "../kids-wizard-pool";
import {
  SENIOR_OPPORTUNITIES_EXPANDED,
  scoreSeniorMatch,
  resolveSeniorMatchProfile,
} from "../seniors-content";

describe("wizard ranking covers full catalog", () => {
  it("paid Adult wizard pool includes every adult-audience hustle", () => {
    const pool = wizardPoolForMembership("adult", {
      isLoggedIn: true,
      membershipTier: "pro",
    });
    const adultIds = hustlesForAudience("adult").map((h) => h.id).sort();
    expect(pool.map((h) => h.id).sort()).toEqual(adultIds);
  });

  it("scores every adult hustle via profile or tag heuristic (never silent skip)", () => {
    for (const h of hustlesForAudience("adult")) {
      const profile = getAdultWizardProfile(h.id, h.matchTags ?? []);
      expect(Object.keys(profile.skills).length + Object.keys(profile.goals).length).toBeGreaterThan(0);
    }
  });

  it("Kids/Teens wizard pools include every catalog hustle for that audience", () => {
    const kidsPool = new Set(kidsWizardPoolForMode("kids").map((h) => h.id));
    const juniorPool = new Set(kidsWizardPoolForMode("junior").map((h) => h.id));
    for (const h of hustlesForAudience("kids")) {
      expect(kidsPool.has(h.id), `missing kids wizard id ${h.id}`).toBe(true);
    }
    for (const h of hustlesForAudience("junior")) {
      expect(juniorPool.has(h.id), `missing junior wizard id ${h.id}`).toBe(true);
    }
    expect(allKidsJuniorCatalogIds().length).toBeGreaterThan(10);
  });

  it("Senior expanded list includes every senior-audience catalog hustle", () => {
    const expanded = new Set(SENIOR_OPPORTUNITIES_EXPANDED.map((o) => o.id));
    for (const h of hustlesForAudience("senior")) {
      expect(expanded.has(h.id), `missing senior opportunity ${h.id}`).toBe(true);
    }
  });

  it("scores every senior opportunity (hand-tuned or catalog heuristic)", () => {
    const answers = {
      lifestyle: "balanced",
      availability: "flexible",
      skills: ["teaching", "admin"],
      goals: ["income", "flexible", "purpose"],
    };
    for (const o of SENIOR_OPPORTUNITIES_EXPANDED) {
      expect(resolveSeniorMatchProfile(o.id), o.id).toBeTruthy();
      expect(scoreSeniorMatch(o.id, answers), o.id).toBeGreaterThanOrEqual(0);
    }
    // New-style catalog rows must not all collapse to zero
    const scored = SENIOR_OPPORTUNITIES_EXPANDED.map((o) => scoreSeniorMatch(o.id, answers));
    expect(Math.max(...scored)).toBeGreaterThan(0);
  });

  it("catalog length stays the source of truth for adult ranking surface", () => {
    expect(SIDE_HUSTLES.length).toBeGreaterThan(50);
    expect(hustlesForAudience("adult").length).toBe(
      wizardPoolForMembership("adult", { isLoggedIn: true, membershipTier: "elite" }).length,
    );
  });
});
