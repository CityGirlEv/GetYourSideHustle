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
  it("Adult wizard pool includes every adult-audience hustle for Free and paid", () => {
    const adultIds = hustlesForAudience("adult").map((h) => h.id).sort();
    for (const opts of [
      { isLoggedIn: true, membershipTier: "free" },
      { isLoggedIn: true, membershipTier: "pro" },
      { isLoggedIn: false, previewAsGuest: true },
    ] as const) {
      const pool = wizardPoolForMembership("adult", opts);
      expect(pool.map((h) => h.id).sort()).toEqual(adultIds);
    }
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

  it("does not crown Airbnb for every Adult or Senior answer set", () => {
    const strength = [30, 15];
    const goalsW = [30, 18, 10];
    const scoreAdult = (
      id: string,
      tags: string[],
      answers: { budget: string; time: string; skill: string[]; goal: string[] },
    ) => {
      const profile = getAdultWizardProfile(id, tags);
      let score = 0;
      answers.skill.forEach((skill, i) => {
        score += (profile.skills[skill] ?? 0) * (strength[i] ?? 0);
      });
      answers.goal.slice(0, 3).forEach((goal, i) => {
        score += (profile.goals[goal] ?? 0) * (goalsW[i] ?? 0);
      });
      if (profile.budgets.includes(answers.budget)) score += 15;
      if (profile.times.includes(answers.time)) score += 10;
      return score;
    };
    const topAdult = (answers: { budget: string; time: string; skill: string[]; goal: string[] }) => {
      return hustlesForAudience("adult")
        .map((h) => ({ id: h.id, score: scoreAdult(h.id, h.matchTags ?? [], answers) }))
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))[0]?.id;
    };
    const topSenior = (answers: {
      lifestyle: string;
      availability: string;
      skills: string[];
      goals: string[];
    }) => {
      return SENIOR_OPPORTUNITIES_EXPANDED.map((o) => ({
        id: o.id,
        score: scoreSeniorMatch(o.id, answers),
      })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))[0]?.id;
    };

    const creative = topAdult({
      budget: "low",
      time: "very_low",
      skill: ["creative"],
      goal: ["passive", "brand"],
    });
    const hosting = topAdult({
      budget: "high",
      time: "high",
      skill: ["operations"],
      goal: ["physical", "passive"],
    });
    const driving = topAdult({
      budget: "low",
      time: "medium",
      skill: ["vehicle"],
      goal: ["flexible", "local"],
    });
    expect(creative).not.toBe("airbnb");
    expect(driving).not.toBe("airbnb");
    expect(hosting).not.toBe(creative);
    expect(new Set([creative, hosting, driving]).size).toBe(3);

    const gentle = topSenior({
      lifestyle: "gentle",
      availability: "light",
      skills: ["creative", "writing"],
      goals: ["purpose", "learn", "flexible"],
    });
    const hands = topSenior({
      lifestyle: "active",
      availability: "flexible",
      skills: ["hands_on"],
      goals: ["income", "flexible", "social"],
    });
    const teach = topSenior({
      lifestyle: "balanced",
      availability: "light",
      skills: ["teaching"],
      goals: ["purpose", "social", "expertise"],
    });
    expect(gentle).not.toBe("airbnb");
    expect(gentle).not.toBe("str-cohost");
    expect(hands).not.toBe("airbnb");
    expect(teach).not.toBe("airbnb");
    expect(new Set([gentle, hands, teach]).size).toBe(3);
  });

  it("catalog length stays the source of truth for adult ranking surface", () => {
    expect(SIDE_HUSTLES.length).toBeGreaterThan(50);
    expect(hustlesForAudience("adult").length).toBe(
      wizardPoolForMembership("adult", { isLoggedIn: true, membershipTier: "elite" }).length,
    );
  });
});
