import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import {
  detailedStepsForGuide,
  guideRequiresBeforeAfterPhotos,
} from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import {
  FREE_WIZARD_HUSTLE_IDS,
  hustleById,
  SIDE_HUSTLES,
} from "../side-hustle-catalog";
import { countFreeGuideLibrary, uniqueGuideLibraryEntries } from "../guide-library-pool";
import { SENIOR_FREE_GUIDE_IDS } from "../age-library-tiers";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  CLEANING_SERVICE_DETAILED_STEPS,
  CLEANING_SERVICE_NOTES_WORKSHEET,
  CLEANING_SERVICE_PRICING,
  CLEANING_SERVICE_REALITY_CHECK,
  computeCleaningServiceProfit,
} from "../cleaning-service-guide";

const GUIDE_ID = "cleaning-service";

describe("Guide #004 Cleaning Service", () => {
  it("keeps a single #004 id, exact title, Free library access, 8–25 hrs, and $600–$4,000+", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("004");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("004");
    const idsFor004 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "004")
      .map(([id]) => id);
    expect(idsFor004).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Cleaning Service");
    expect(h.name).not.toMatch(
      /guide upgrade|cleaning guide|residential cleaning|house cleaning guide|free guide|member guide/i,
    );
    expect(h.audiences).toEqual(["adult", "senior"]);
    expect(h.audiences).not.toContain("kids");
    expect(h.audiences).not.toContain("junior");
    expect(h.timeReq).toMatch(/8\s*-\s*25 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$600/);
    expect(h.potentialIncome).toMatch(/\$4,000/);
    expect(h.minTier).toBe("free");
    expect(h.freeWizardEligible).toBe(true);
    expect(h.difficulty).toBe("Easy");
    expect(h.category).toMatch(/Home\s*&\s*Local Services\s*\/\s*Cleaning/i);
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("free");
    expect(FREE_WIZARD_HUSTLE_IDS).toContain(GUIDE_ID);
    expect(FREE_WIZARD_HUSTLE_IDS).toHaveLength(20);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(SENIOR_FREE_GUIDE_IDS).toContain(GUIDE_ID);
    expect(guideRequiresBeforeAfterPhotos(GUIDE_ID)).toBe(true);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, replaced pricing, core vacuum, tools, notes", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /never mix|biohazard|security-deposit/i.test(`${p.label} ${p.detail}`))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.intro).toMatch(/STANDARD CLEAN/i);
    expect(kit.suggestedPricing?.intro).toMatch(/\$600/);
    expect(kit.suggestedPricing?.intro).toMatch(/\$4,000/);
    expect(kit.suggestedPricing?.intro).not.toMatch(/REPLACE THE OLD LIST/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$80 – \$130/i.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => i.id === "vacuum" && !i.optional)).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack|google forms|canva/i.test(t.name))).toBe(true);
    expect(CLEANING_SERVICE_REALITY_CHECK.title).toMatch(/define what .*clean.* includes before you quote/i);
    expect(CLEANING_SERVICE_NOTES_WORKSHEET).toMatch(/BUSINESS SETUP/i);
    expect(CLEANING_SERVICE_PRICING.items.some((i) => /move-in \/ move-out/i.test(i.label))).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = CLEANING_SERVICE_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/define your cleaning services/i);
    expect(core[1]?.title).toMatch(/build your pricing & quote system/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/complete client intake/i);
    expect(core[6]?.title).toMatch(/prep supplies & clean in a system/i);
    expect(core[6]?.desc).toMatch(/never mix chemicals/i);
    expect(core[7]?.title).toMatch(/room-by-room quality checklist/i);
    expect(core[8]?.title).toMatch(/move-outs & str turnovers/i);
    expect(core[8]?.desc).toMatch(/security-deposit/i);
    expect(core[8]?.desc).toMatch(/never share door\/alarm codes/i);
    expect(core[9]?.title).toMatch(/get paid & track real profit/i);
    expect(core[9]?.title).not.toMatch(/price|pricing|rates/i);
    expect(core[10]?.title).toMatch(/turn good jobs into recurring routes/i);

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

  it("uses Cleaning Profit Calculator: $2,765 revenue, $565 expenses, $2,200 profit, ≈ $23.16/hr", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Cleaning Service");
    expect(profile.title).toMatch(/cleaning profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "standardCleansPerWeek")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "jobsPerMonth")).toBe(false);

    const result = computeGuideCalc(
      "service",
      {
        standardCleansPerWeek: 5,
        averageStandardPrice: 100,
        specialtyJobsPerMonth: 2,
        averageSpecialtyPrice: 225,
        monthlyAddOnRevenue: 150,
        tipsOtherRevenue: 0,
        cleaningHours: 80,
        travelAdminHours: 15,
      },
      [
        { id: "supplies", label: "Supplies", amount: 200 },
        { id: "fuelTravel", label: "Fuel / travel", amount: 180 },
        { id: "parking", label: "Parking", amount: 20 },
        { id: "laundry", label: "Laundry", amount: 40 },
        { id: "paymentFees", label: "Payment fees", amount: 35 },
        { id: "advertising", label: "Advertising", amount: 40 },
        { id: "insuranceLicensing", label: "Insurance", amount: 50 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(2765);
    expect(result.expenses).toBe(565);
    expect(result.net).toBe(2200);
    expect(result.metrics?.netPerHour).toBeCloseTo(23.16, 2);

    const helper = computeCleaningServiceProfit({
      standardCleansPerWeek: 5,
      averageStandardPrice: 100,
      specialtyJobsPerMonth: 2,
      averageSpecialtyPrice: 225,
      monthlyAddOnRevenue: 150,
      supplies: 200,
      fuelTravel: 180,
      parking: 20,
      laundry: 40,
      paymentFees: 35,
      advertising: 40,
      insuranceLicensing: 50,
      cleaningHours: 80,
      travelAdminHours: 15,
    });
    expect(helper.monthlyRevenue).toBe(2765);
    expect(helper.monthlyExpenses).toBe(565);
    expect(helper.monthlyProfit).toBe(2200);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(23.16, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Cleaning Service");
    expect(pdf.pricing?.some((p) => /\$80|\$130|STANDARD CLEAN/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /define your cleaning services/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /recurring routes/i.test(s.title))).toBe(true);
  });
});
