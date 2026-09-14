import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { kidsLibraryMinTier, juniorLibraryMinTier } from "../age-library-tiers";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import {
  TECH_HELPER_DETAILED_STEPS,
  TECH_HELPER_NOTES_WORKSHEET,
  TECH_HELPER_REALITY_CHECK,
  computeTechHelperProfit,
} from "../tech-helper-guide";

const GUIDE_ID = "tech-helper";

describe("Guide #101 Senior Tech Helper / Smartphone Tutor", () => {
  it("keeps a single #101 id, exact title, Elite, 2–8 hrs, and $10–$25/hour", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("101");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("101");
    const idsFor101 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "101")
      .map(([id]) => id);
    expect(idsFor101).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Senior Tech Helper / Smartphone Tutor");
    expect(h.name).not.toMatch(
      /guide upgrade|senior tech guide|smartphone guide|tech tutor guide|elite guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$25/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Tech Help\s*\/\s*Personal Tutoring/i);
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|privacy|helpful|before/i.test(p.label))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$10 – \$25/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$15|\$25|\$45/i.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => /notebook|cheat|charger|smartphone/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /docs|notes|beginner tool stack/i.test(t.name))).toBe(true);
    expect(TECH_HELPER_REALITY_CHECK.title).toMatch(/teach, don't take over/i);
    expect(TECH_HELPER_NOTES_WORKSHEET).toMatch(/MY TECH-HELP SERVICE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = TECH_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/choose your tech-help lessons/i);
    expect(core[1]?.title).toMatch(/starter session/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/tech confidence check/i);
    expect(core[7]?.title).toMatch(/repeatable practice/i);
    expect(core[8]?.title).toMatch(/video calls, apps/i);
    expect(core[9]?.title).toMatch(/scam & safety/i);
    expect(core[10]?.title).toMatch(/cheat sheet & rebook/i);

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

  it("uses Senior Tech Helper Profit Calculator with spec example math", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Senior Tech Helper / Smartphone Tutor");
    expect(profile.title).toMatch(/senior tech helper profit calculator/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 4,
        avgTicket: 35,
        extraEventPay: 25,
        hoursPerShoot: 1,
        editingHoursPerShoot: 0.5,
      },
      [
        { id: "transport", label: "Travel/fuel", amount: 10 },
        { id: "printing", label: "Printing", amount: 5 },
        { id: "ads", label: "Advertising", amount: 5 },
        { id: "supplies", label: "Supplies", amount: 5 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(165);
    expect(result.expenses).toBe(25);
    expect(result.net).toBe(140);
    expect(result.metrics?.netPerHour).toBeCloseTo(23.333, 2);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const helper = computeTechHelperProfit({
      averageSessionFee: 35,
      sessionsPerWeek: 4,
      packageFollowUpRevenue: 25,
      travelFuel: 10,
      printing: 5,
      advertising: 5,
      supplies: 5,
      otherBusinessExpenses: 0,
      averageSessionHours: 1,
      averageTravelAdminHoursPerSession: 0.5,
    });
    expect(helper.weeklyRevenue).toBe(165);
    expect(helper.weeklyProfit).toBe(140);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(606.2, 1);
    expect(helper.weeklyHours).toBe(6);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(23.333, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Senior Tech Helper / Smartphone Tutor");
    expect(pdf.steps.some((s) => /choose your tech-help lessons/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /scam & safety/i.test(s.title))).toBe(true);
  });
});
