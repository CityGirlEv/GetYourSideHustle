import { describe, expect, it } from "vitest";
import {
  ensureGuideFoundationSteps,
  NAME_SIDE_HUSTLE_STEP,
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

  it("step 1 reminds makers to check local business licenses and regulations", () => {
    expect(PARENT_THUMBS_UP_STEP.desc).toMatch(/business license/i);
    expect(PARENT_THUMBS_UP_STEP.desc).toMatch(/local regulations/i);
    expect(PARENT_THUMBS_UP_STEP.desc).toMatch(/abide/i);
    const steps = ensureGuideFoundationSteps(
      [{ title: "Do the work", desc: "Deliver." }],
      { audiences: ["adult"], foundation: "business" },
    );
    expect(steps[0]?.desc).toMatch(/business license/i);
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

  it("Pick a Name covers clearance research and the IRS EIN apply page", () => {
    expect(NAME_SIDE_HUSTLE_STEP.desc).toMatch(/not already taken|not violating/i);
    expect(NAME_SIDE_HUSTLE_STEP.desc).toMatch(/copyright|trademark/i);
    expect(NAME_SIDE_HUSTLE_STEP.desc).toMatch(/irs\.gov/i);
    expect(NAME_SIDE_HUSTLE_STEP.desc).toMatch(/EIN/i);
    const steps = ensureGuideFoundationSteps(
      [{ title: "Pick a Name for Your Side Hustle", desc: "Old custom copy." }],
      { foundation: "business" },
    );
    expect(steps.find((s) => /pick a name/i.test(s.title))?.desc).toMatch(/EIN/i);
  });

  it("every business library guide keeps Pick a Name (USPTO + EIN) as step 3 when unpatched", async () => {
    const { guideUsesNonLaunchPlaybook, guideUsesPlatformMarketplacePlaybook } = await import("../guide-detailed-steps");
    const { uniqueGuideLibraryEntries } = await import("../guide-library-pool");
    const { resolveGuideKit } = await import("../guide-kit-overrides");
    for (const e of uniqueGuideLibraryEntries()) {
      if (guideUsesNonLaunchPlaybook(e.id) || guideUsesPlatformMarketplacePlaybook(e.id)) continue;
      const steps = resolveGuideKit(e.id).steps ?? [];
      expect(steps[0]?.title, e.id).toBe(PARENT_THUMBS_UP_STEP.title);
      expect(steps[1]?.title, e.id).toMatch(/research competitors/i);
      expect(steps[2]?.title, e.id).toBe(NAME_SIDE_HUSTLE_STEP.title);
      expect(steps[2]?.desc, e.id).toMatch(/uspto\.gov\/trademarks\/search/i);
      expect(steps[2]?.desc, e.id).toMatch(/EIN/i);
      expect(steps[2]?.desc, e.id).toMatch(/irs\.gov/i);
    }
  });

  it("every business library guide ends with Make Your First Sale + Ask for a Short Review", async () => {
    const {
      guideUsesNonLaunchPlaybook,
      guideUsesPlatformMarketplacePlaybook,
      MAKE_YOUR_FIRST_SALE_STEP,
      ASK_FOR_REVIEW_STEP,
    } = await import("../guide-detailed-steps");
    const { uniqueGuideLibraryEntries } = await import("../guide-library-pool");
    const { resolveGuideKit } = await import("../guide-kit-overrides");
    for (const e of uniqueGuideLibraryEntries()) {
      if (guideUsesNonLaunchPlaybook(e.id) || guideUsesPlatformMarketplacePlaybook(e.id)) continue;
      const steps = resolveGuideKit(e.id).steps ?? [];
      expect(steps.length, e.id).toBeGreaterThanOrEqual(2);
      expect(steps[steps.length - 2]?.title, e.id).toBe(MAKE_YOUR_FIRST_SALE_STEP.title);
      expect(steps[steps.length - 2]?.desc, e.id).toMatch(/Revenue Calculator/i);
      expect(steps[steps.length - 2]?.desc, e.id).toMatch(/expenses/i);
      expect(steps[steps.length - 1]?.title, e.id).toBe(ASK_FOR_REVIEW_STEP.title);
      expect(steps[steps.length - 1]?.desc, e.id).toMatch(/review/i);
    }
  });

  it("savings guides skip Make Your First Sale closing steps", async () => {
    const { resolveGuideKit } = await import("../guide-kit-overrides");
    for (const id of [
      "kids-piggy-first-goal",
      "junior-savings-ceo",
      "kids-reinvest-jar",
      "junior-reinvest-ceo",
      "junior-give-back-teach",
    ]) {
      const steps = resolveGuideKit(id).steps ?? [];
      expect(steps.some((s) => /make your first sale/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /^ask for a short review$/i.test(s.title)), id).toBe(false);
    }
  });

  it("honors an admin steps patch without re-injecting deleted foundation steps", async () => {
    const { resolveGuideKit } = await import("../guide-kit-overrides");
    const steps =
      resolveGuideKit("handyman", {
        steps: [{ title: "Do the work", desc: "Patched body without foundation." }],
      }).steps ?? [];
    expect(steps).toEqual([{ title: "Do the work", desc: "Patched body without foundation." }]);
    expect(steps.some((s) => /pick a name/i.test(s.title))).toBe(false);
    expect(steps.some((s) => /research competitors/i.test(s.title))).toBe(false);
  });

  it("keeps Take Before Photos after Pick a Name on cleaning-service", async () => {
    const { finalizeGuidePlaybookSteps } = await import("../guide-detailed-steps");
    const steps = finalizeGuidePlaybookSteps("cleaning-service", [
      { title: "Take Before Photos", desc: "old" },
      { title: "Vacuum", desc: "Clean." },
    ]);
    expect(steps[0]?.title).toBe(PARENT_THUMBS_UP_STEP.title);
    expect(steps[1]?.title).toMatch(/research competitors/i);
    expect(steps[2]?.title).toBe(NAME_SIDE_HUSTLE_STEP.title);
    expect(steps.some((s) => /^take before photos$/i.test(s.title))).toBe(true);
    expect(steps.findIndex((s) => /^take before photos$/i.test(s.title))).toBeGreaterThan(2);
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

  it("savings guides (#016 / #019) skip business naming and marketing", () => {
    for (const id of ["kids-piggy-first-goal", "junior-savings-ceo"]) {
      const steps = guideKitForId(id).steps ?? [];
      expect(steps.length, id).toBeGreaterThan(3);
      expect(steps[0]?.title, id).toBe(PARENT_THUMBS_UP_STEP.title);
      expect(steps.some((s) => /research competitors/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /pick a name for your side hustle/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /make your marketing materials/i.test(s.title)), id).toBe(false);
      expect(
        steps.some((s) =>
          /pick your goal|name what you are saving for|find the price|write the cost/i.test(
            s.title,
          ),
        ),
        id,
      ).toBe(true);
    }
  });

  it("reinvest guides (#074 / #099) use savings foundation like piggy bank", () => {
    for (const id of ["kids-reinvest-jar", "junior-reinvest-ceo"]) {
      const steps = guideKitForId(id).steps ?? [];
      expect(steps.length, id).toBeGreaterThan(3);
      expect(steps[0]?.title, id).toBe(PARENT_THUMBS_UP_STEP.title);
      expect(steps.some((s) => /research competitors/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /pick a name for your side hustle/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /make your marketing materials/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /make your first sale/i.test(s.title)), id).toBe(false);
      expect(steps.some((s) => /ask for a short review/i.test(s.title)), id).toBe(false);
    }
    const kids = guideKitForId("kids-reinvest-jar").steps ?? [];
    expect(kids.some((s) => /three jars/i.test(s.title))).toBe(true);
    expect(kids.some((s) => /pick your split|split your money/i.test(s.title))).toBe(true);
    expect(kids.some((s) => /grow wish|put some earnings/i.test(s.title))).toBe(true);

    const teen = guideKitForId("junior-reinvest-ceo").steps ?? [];
    expect(teen.some((s) => /3 ceo buckets|three buckets/i.test(s.title))).toBe(true);
    expect(teen.some((s) => /choose your split|split your money|split rule/i.test(s.title))).toBe(
      true,
    );
    expect(teen.some((s) => /grow list|reinvest|grow spends/i.test(s.title))).toBe(true);
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
