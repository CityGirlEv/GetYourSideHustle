import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  YARD_HELP_DETAILED_STEPS,
  YARD_HELP_NOTES_WORKSHEET,
  YARD_HELP_REALITY_CHECK,
  computeYardHelpProfit,
} from "../yard-help-guide";

const GUIDE_ID = "yard-help";

describe("Guide #020 Yard & Garden Helper", () => {
  it("keeps a single #020 id, exact title, Free library access, 3–10 hrs, and $15–$30/yard", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("020");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("020");
    const idsFor020 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "020")
      .map(([id]) => id);
    expect(idsFor020).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Yard & Garden Helper");
    expect(h.name).not.toMatch(
      /guide upgrade|yard help guide|garden helper guide|landscaping guide|free guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$30/);
    expect(h.potentialIncome).toMatch(/yard/i);
    expect(h.minTier).toBe("free");
    expect(h.freeWizardEligible).toBe(true);
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("free");
    expect(h.category).toMatch(/Outdoor\s*\/\s*Yard Services/i);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before|minors|stop/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.items.some((i) => /\$15|\$20|\$25|\$30/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$15 – \$30/i);
    expect(kit.supplies?.items.some((i) => /glove|rake|bag/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack|calendar|weather/i.test(t.name))).toBe(true);
    expect(YARD_HELP_REALITY_CHECK.title).toMatch(/light yard help/i);
    expect(YARD_HELP_REALITY_CHECK.title).toMatch(/not dangerous landscaping/i);
    expect(YARD_HELP_NOTES_WORKSHEET).toMatch(/MY YARD & GARDEN HELPER PLAN/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = YARD_HELP_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/choose your safe yard services/i);
    expect(core[0]?.desc).toMatch(/I DO NOT DO/i);
    expect(core[1]?.title).toMatch(/\$15–\$30 yard package/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/walk the yard/i);
    expect(core[5]?.desc).toMatch(/weeds vs wanted/i);
    expect(core[6]?.title).toMatch(/weather/i);
    expect(core[7]?.title).toMatch(/smart order/i);
    expect(core[8]?.desc).toMatch(/permission/i);
    expect(core[9]?.title).toMatch(/get paid/i);
    expect(core[10]?.title).toMatch(/repeat seasonal/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
  });

  it("uses Yard & Garden Helper Profit Calculator with weekly hours that are not multiplied by yards", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Yard & Garden Helper");
    expect(profile.title).toMatch(/yard & garden helper profit calculator/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 5,
        avgTicket: 22,
        extraEventPay: 15,
        hoursWorkedPerWeek: 4,
        hoursPerShoot: 2,
      },
      [
        { id: "supplies", label: "Supplies / bags", amount: 8 },
        { id: "transport", label: "Fuel / travel", amount: 7 },
        { id: "disposal", label: "Disposal", amount: 5 },
        { id: "ads", label: "Advertising", amount: 5 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(125);
    expect(result.expenses).toBe(25);
    expect(result.net).toBe(100);
    expect(result.metrics?.netPerHour).toBeCloseTo(16.666, 2);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const helper = computeYardHelpProfit({
      averageYardFee: 22,
      yardsPerWeek: 5,
      addOnRevenue: 15,
      suppliesBags: 8,
      fuelTravel: 7,
      disposal: 5,
      advertising: 5,
      otherExpenses: 0,
      jobHours: 4,
      travelAdminHours: 2,
    });
    expect(helper.weeklyRevenue).toBe(125);
    expect(helper.weeklyProfit).toBe(100);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(433, 0);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(16.67, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Yard & Garden Helper");
    expect(pdf.pricing?.some((p) => /\$15|\$30/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /choose your safe yard services/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /walk the yard/i.test(s.title))).toBe(true);
  });
});
