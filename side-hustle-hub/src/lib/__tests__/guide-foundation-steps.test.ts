import { describe, expect, it } from "vitest";
import {
  ensureGuideFoundationSteps,
  PARENT_THUMBS_UP_STEP,
  youthFirstStepForAudiences,
} from "../guide-detailed-steps";
import { guideKitForId } from "../guide-tools";
import { KIDS_GUIDES } from "../kids-guides";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";

describe("youth parent thumbs-up step", () => {
  it("returns the shared thumbs-up step for every audience lane", () => {
    expect(youthFirstStepForAudiences(["kids"])?.title).toBe(PARENT_THUMBS_UP_STEP.title);
    expect(youthFirstStepForAudiences(["junior"])?.title).toBe(PARENT_THUMBS_UP_STEP.title);
    expect(youthFirstStepForAudiences(["adult"])?.title).toBe(PARENT_THUMBS_UP_STEP.title);
    expect(youthFirstStepForAudiences(["senior"])?.title).toBe(PARENT_THUMBS_UP_STEP.title);
  });

  it("puts thumbs-up first, then competitors and business name for business guides", () => {
    const steps = ensureGuideFoundationSteps(
      [
        { title: "Research Competitors", desc: "Look around." },
        { title: "Pick a Name for Your Side Hustle", desc: "Name it." },
        { title: "Do the work", desc: "Deliver." },
      ],
      { audiences: ["junior"], foundation: "business" },
    );
    expect(steps[0]?.title).toBe(PARENT_THUMBS_UP_STEP.title);
    expect(steps[1]?.title).toBe("Research Competitors");
    expect(steps[2]?.title).toBe("Pick a Name for Your Side Hustle Business");
    expect(steps[3]?.title).toBe("Do the work");
  });

  it("savings foundation skips competitors and business naming", () => {
    const steps = ensureGuideFoundationSteps(
      [
        { title: "Name what you are saving for", desc: "A bike." },
        { title: "Write the cost", desc: "$80." },
        { title: "Plan how you will earn", desc: "Chores." },
        { title: "Set your weekly savings goal", desc: "$10." },
      ],
      { audiences: ["kids"], foundation: "savings" },
    );
    expect(steps[0]?.title).toBe(PARENT_THUMBS_UP_STEP.title);
    expect(steps.some((s) => /research competitors/i.test(s.title))).toBe(false);
    expect(steps.some((s) => /pick a name for your side hustle/i.test(s.title))).toBe(false);
    expect(steps.map((s) => s.title)).toEqual([
      PARENT_THUMBS_UP_STEP.title,
      "Name what you are saving for",
      "Write the cost",
      "Plan how you will earn",
      "Set your weekly savings goal",
    ]);
  });

  it("every Kids Corner / Teens guide starts with parent thumbs-up", () => {
    for (const g of KIDS_GUIDES) {
      expect(g.steps[0]?.title, g.id).toBe(PARENT_THUMBS_UP_STEP.title);
    }
  });

  it("savings guides (#016 / #019) model the same savings steps", () => {
    for (const id of ["kids-piggy-first-goal", "junior-savings-ceo"]) {
      const steps = guideKitForId(id).steps ?? [];
      expect(steps.length, id).toBeGreaterThan(3);
      expect(steps[0]?.title, id).toBe(PARENT_THUMBS_UP_STEP.title);
      expect(steps.some((s) => /research competitors/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /pick a name for your side hustle/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /name what you are saving for/i.test(s.title)), id).toBe(true);
      expect(steps.some((s) => /write the cost/i.test(s.title)), id).toBe(true);
      expect(steps.some((s) => /plan how you will earn/i.test(s.title)), id).toBe(true);
      expect(steps.some((s) => /weekly savings goal/i.test(s.title)), id).toBe(true);
    }
  });

  it("catalog kids/teen hustles resolve with thumbs-up as step 1", () => {
    const youthIds = SIDE_HUSTLES.filter(
      (h) => h.audiences.includes("kids") || h.audiences.includes("junior"),
    ).map((h) => h.id);
    expect(youthIds.length).toBeGreaterThan(10);
    for (const id of youthIds.slice(0, 40)) {
      const steps = guideKitForId(id).steps ?? [];
      if (!steps.length) {
        const h = hustleById(id);
        expect(h, id).toBeTruthy();
        continue;
      }
      expect(steps[0]?.title, id).toBe(PARENT_THUMBS_UP_STEP.title);
    }
  });
});
