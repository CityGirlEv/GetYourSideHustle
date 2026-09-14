import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  HOUSE_SITTER_DETAILED_STEPS,
  HOUSE_SITTER_NOTES_WORKSHEET,
  HOUSE_SITTER_REALITY_CHECK,
  computeHouseSitterProfit,
} from "../house-sitter-guide";

const GUIDE_ID = "house-sitter";

describe("Guide #077 House Sitter", () => {
  it("keeps a single #077 id, exact title, Starter membership, 2–8 hrs, and $10–$40/job", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("077");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("077");
    const idsFor077 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "077")
      .map(([id]) => id);
    expect(idsFor077).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("House Sitter");
    expect(h.name).not.toMatch(/guide upgrade|house sitting guide|home watch|starter guide|member guide/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Home Services\s*\/\s*Property Check-In/i);
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before accepting|minors/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.items.some((i) => /\$10|\$15|\$25|\$40/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$10 – \$40/i);
    expect(kit.supplies?.items.some((i) => /phone|checklist|key/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /calendar|checklist|beginner tool stack/i.test(t.name))).toBe(true);
    expect(HOUSE_SITTER_REALITY_CHECK.title).toMatch(/trusted with someone/i);
    expect(HOUSE_SITTER_NOTES_WORKSHEET).toMatch(/MY HOUSE-SITTING SERVICE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = HOUSE_SITTER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/define your house-sitting service/i);
    expect(core[0]?.desc).toMatch(/I WILL NOT DO/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/pre-trip walkthrough/i);
    expect(core[6]?.title).toMatch(/access plan/i);
    expect(core[7]?.desc).toMatch(/mail|plants|lights/i);
    expect(core[8]?.desc).toMatch(/emergency/i);
    expect(core[9]?.title).toMatch(/final visit/i);
    expect(core[10]?.title).toMatch(/rebooked/i);

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

  it("uses House Sitter Profit Calculator", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "House Sitter");
    expect(profile.title).toMatch(/house sitter profit calculator/i);
    expect(profile.disclaimerExtra).toMatch(/revenue = money received/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 4,
        avgTicket: 20,
        extraEventPay: 10,
        hoursPerShoot: 1,
      },
      [
        { id: "transport", label: "Travel/fuel", amount: 8 },
        { id: "tolls", label: "Parking/tolls", amount: 2 },
        { id: "supplies", label: "Supplies", amount: 3 },
        { id: "ads", label: "Advertising", amount: 2 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(90);
    expect(result.expenses).toBe(15);
    expect(result.net).toBe(75);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const helper = computeHouseSitterProfit({
      averageFeePerVisit: 20,
      paidVisitsPerWeek: 4,
      addOnRevenue: 10,
      travelFuel: 8,
      parkingTolls: 2,
      supplies: 3,
      advertising: 2,
      otherExpenses: 0,
      averageHoursPerVisitIncludingTravel: 1,
    });
    expect(helper.weeklyRevenue).toBe(90);
    expect(helper.weeklyProfit).toBe(75);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(324.75, 1);
    expect(helper.effectiveProfitPerHour).toBe(18.75);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("House Sitter");
    expect(pdf.pricing?.some((p) => /\$10|\$40/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /define your house-sitting service/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /pre-trip walkthrough/i.test(s.title))).toBe(true);
  });
});
