import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  VIRTUAL_RECEPTIONIST_DETAILED_STEPS,
  VIRTUAL_RECEPTIONIST_NOTES_WORKSHEET,
  VIRTUAL_RECEPTIONIST_PRICING,
  VIRTUAL_RECEPTIONIST_REALITY_CHECK,
  VIRTUAL_RECEPTIONIST_SUPPLIES,
  VIRTUAL_RECEPTIONIST_TOOLS,
  computeVirtualReceptionistProfit,
  virtualReceptionistToolsDisclaimer,
} from "../virtual-receptionist-guide";

const GUIDE_ID = "virtual-receptionist";

describe("Guide #115 Virtual Receptionist", () => {
  it("keeps a single #115 id, exact title, Pro, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("115");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("115");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Virtual Receptionist");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Professional Services / Call Handling");
    expect(h.timeReq).toMatch(/3 - 10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("junior");
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/call/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps router / emergency-script copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? VIRTUAL_RECEPTIONIST_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/coverage/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /headset|phone|quiet/i.test(i.name))).toBe(true);
    expect(VIRTUAL_RECEPTIONIST_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(VIRTUAL_RECEPTIONIST_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(virtualReceptionistToolsDisclaimer()).toMatch(/emergency/i);
    expect(VIRTUAL_RECEPTIONIST_REALITY_CHECK.title).toMatch(/router/i);
    expect(VIRTUAL_RECEPTIONIST_NOTES_WORKSHEET).toMatch(/CLIENT AND COVERAGE/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(false);
  });

  it("includes exactly 11 authored core steps without injected generic marketing titles", () => {
    const core = VIRTUAL_RECEPTIONIST_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose a Safe Call-Handling Niche",
      "Define Coverage and Price",
      "Build the Script and Decision Tree",
      "Build Privacy, Recording, and Emergency Rules",
      "Test the Phone and Handoff System",
      "Create Honest Marketing Materials",
      "Qualify and Onboard the Client",
      "Complete a Paid Pilot Shift",
      "Answer, Clarify, and Route",
      "Escalate and Hand Off Accurately",
      "Review Quality, Invoice, and Improve",
    ]);
    expect(core[0]?.desc).toMatch(/call/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /create honest marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /qualify and onboard the client/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(0);
  });

  it("uses monthly calculator: $500 revenue, $75 expenses, $425 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Virtual Receptionist");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "vrCoverageBlocksCompleted")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      vrCoverageBlocksCompleted: 6,
      averageFeePerBlock: 50,
      monthlyRetainerRevenueCollected: 150,
      overageAfterHoursRevenue: 30,
      setupReportingAddOnRevenue: 20,
      otherEarnedRevenue: 0,
      phoneVoipCrmSoftware: 30,
      equipmentInternetAllocation: 15,
      paymentFees: 5,
      trainingInsuranceProfessionalServices: 10,
      backupCoverageSubcontractors: 10,
      otherExpenses: 5,
      reservedCoverageHours: 16,
      setupTrainingReportingHours: 2,
      marketingAdminHours: 2,
    };
    const helper = computeVirtualReceptionistProfit(example);
    expect(helper.blockRevenue).toBe(300);
    expect(helper.grossServiceRevenue).toBe(500);
    expect(helper.totalExpenses).toBe(75);
    expect(helper.estimatedProfit).toBe(425);
    expect(helper.totalHours).toBe(20);
    expect(helper.profitPerHour).toBeCloseTo(21.25, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(500);
    expect(result.expenses).toBe(75);
    expect(result.net).toBe(425);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Virtual Receptionist");
    expect(pdf.steps.some((s) => /safe call-handling niche/i.test(s.title))).toBe(true);
  });
});
