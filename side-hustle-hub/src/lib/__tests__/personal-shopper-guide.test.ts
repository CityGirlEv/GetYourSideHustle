import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import {
  guideCalcModeForId,
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  PERSONAL_SHOPPER_DETAILED_STEPS,
  PERSONAL_SHOPPER_NOTES_WORKSHEET,
  PERSONAL_SHOPPER_REALITY_CHECK,
} from "../personal-shopper-guide";

const GUIDE_ID = "personal-shopper";

describe("Guide #092 Personal Shopper", () => {
  it("keeps a single #092 id and title", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("092");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("092");
    const idsFor092 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "092")
      .map(([id]) => id);
    expect(idsFor092).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Personal Shopper");
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("junior");
    expect(h.timeReq).toMatch(/8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.category).toMatch(/Errands|Personal Services/i);
  });

  it("ships all prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(
      kit.prerequisites.some((p) =>
        /requirements|confirm|money|merchandise|list is the job|overview/i.test(p.label),
      ),
    ).toBe(true);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/simple shopping fees/i);
    expect(kit.suggestedPricing?.intro).toMatch(/merchandise/i);
    expect(kit.supplies?.items.some((i) => /insulated|reusable/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /google maps/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /store apps/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(PERSONAL_SHOPPER_REALITY_CHECK.title).toMatch(/list is the job/i);
    expect(PERSONAL_SHOPPER_NOTES_WORKSHEET).toMatch(/Personal Shopper Client Planner/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–4", () => {
    const core = PERSONAL_SHOPPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[2]?.title).toMatch(/create your marketing campaign/i);
    expect(core[3]?.title).toMatch(/execute your marketing campaign/i);

    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    // No duplicate generic Make/Carry injection when Create/Execute are present
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /carry out the marketing plan/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /create your marketing campaign/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /execute your marketing campaign/i.test(t))).toHaveLength(1);

    expect(titles).toEqual(
      expect.arrayContaining([
        "Decide what shopping/errand services you will offer",
        "Choose your normal service area",
        "Create Your Marketing Campaign",
        "Execute your marketing campaign",
        "Get the client's written shopping list",
        "Confirm store, brands, substitutions, budget, and payment",
        "Plan the most efficient route",
        "Shop carefully and check items off the list",
        "Handle unavailable items with substitutions or a quick text",
        "Check the receipt, photograph it, organize purchases, and deliver",
        "Confirm delivery, settle payment, and offer recurring shopping",
        "Make Your First Sale",
        "Ask for a Short Review",
      ]),
    );
  });

  it("uses Personal Shopper Profit Calculator with weekly → monthly estimate", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("service");
    const profile = guideCalcProfileForId(GUIDE_ID, "Personal Shopper");
    expect(profile.title).toMatch(/Personal Shopper Profit Calculator/i);
    expect(profile.budget.map((b) => b.id)).toEqual(["transport", "other"]);
    expect(profile.defaults.addOnFees).toBe(0);

    const result = computeGuideCalc(
      "service",
      { jobsPerMonth: 5, avgTicket: 25, addOnFees: 0 },
      [
        { id: "transport", label: "Mileage / travel cost", amount: 20 },
        { id: "other", label: "Other expenses", amount: 5 },
      ],
    );
    expect(result.revenue).toBe(125);
    expect(result.expenses).toBe(25);
    expect(result.net).toBe(100);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Personal Shopper");
    expect(pdf.prerequisites.some((p) => /written list|merchandise|requirements/i.test(p))).toBe(
      true,
    );
    expect(pdf.pricing?.some((p) => /QUICK ERRAND|STANDARD SHOP/i.test(p))).toBe(true);
    expect(pdf.supplies.some((s) => /insulated|reusable/i.test(s.name))).toBe(true);
    expect(pdf.tools.some((t) => /google maps|store apps/i.test(t))).toBe(true);
    expect(pdf.steps.some((s) => /written shopping list/i.test(s.title))).toBe(true);
    expect(pdf.steps.length).toBe((kit.steps ?? []).length);
  });
});
