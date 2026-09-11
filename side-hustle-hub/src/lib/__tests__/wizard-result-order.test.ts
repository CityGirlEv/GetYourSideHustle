import { describe, expect, it } from "vitest";
import {
  compareWizardRank,
  relativeMatchPct,
  sortWizardFreeFirstThenScore,
  wizardMatchTierLabel,
  wizardRankingDisclaimer,
} from "../wizard-result-order";

describe("wizard-result-order", () => {
  it("lists free hustles before higher-scoring paid ones", () => {
    const rows = sortWizardFreeFirstThenScore([
      { id: "airbnb", score: 99 },
      { id: "dog-walk", score: 40 },
      { id: "yard-help", score: 55 },
      { id: "tutoring", score: 80 },
    ]);
    expect(rows.map((r) => r.id)).toEqual(["yard-help", "dog-walk", "airbnb", "tutoring"]);
  });

  it("keeps match % relative to the best overall score", () => {
    expect(relativeMatchPct(40, 80)).toBe(50);
    expect(relativeMatchPct(80, 80)).toBe(100);
  });

  it("labels the first free result as a top free start", () => {
    expect(wizardMatchTierLabel(0, 70, "dog-walk")).toBe("Top free start");
    expect(wizardMatchTierLabel(0, 100, "airbnb")).toBe("Best match");
  });

  it("explains free-first vs highest match in the disclaimer", () => {
    const note = wizardRankingDisclaimer().toLowerCase();
    expect(note).toMatch(/free/);
    expect(note).toMatch(/match %/);
    expect(compareWizardRank({ id: "dog-walk", score: 1 }, { id: "airbnb", score: 99 })).toBeLessThan(0);
  });
});
