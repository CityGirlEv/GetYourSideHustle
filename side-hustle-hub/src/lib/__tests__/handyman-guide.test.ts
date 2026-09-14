import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  HANDYMAN_DETAILED_STEPS,
  HANDYMAN_NOTES_WORKSHEET,
  HANDYMAN_PRICING,
  HANDYMAN_REALITY_CHECK,
  HANDYMAN_SUPPLIES,
  HANDYMAN_TOOLS,
  computeHandymanProfit,
  handymanToolsDisclaimer,
} from "../handyman-guide";

const GUIDE_ID = "handyman";

describe("Guide #011 Handyman Services", () => {
  it("keeps a single #011 id, exact title, time, Free access, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("011");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("011");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Handyman Services");
    expect(h.name).not.toMatch(/guide upgrade|handyman guide|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/1\s*-\s*2 weeks/i);
    expect(h.potentialIncome).toMatch(/\$800/);
    expect(h.potentialIncome).toMatch(/\$5,000/);
    expect(h.potentialIncome).toMatch(/examples only/i);
    expect(h.minTier).toBe("free");
    expect(FREE_WIZARD_HUSTLE_IDS).toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and distinguishes reimbursements from profit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? HANDYMAN_PRICING.intro);
    expect(intro).toMatch(/GROSS SERVICE REVENUE/i);
    expect(intro).toMatch(/NOT handyman profit/i);
    expect(intro).toMatch(/\$40–\$100/);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /tape measure/i.test(i.name))).toBe(true);
    expect(HANDYMAN_SUPPLIES.items.some((i) => /job-specific materials/i.test(i.name) && i.optional)).toBe(
      true,
    );
    expect(HANDYMAN_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(handymanToolsDisclaimer()).toMatch(/do not buy a full workshop/i);
    expect(HANDYMAN_REALITY_CHECK.body).toMatch(/DO-NOT-DO/i);
    expect(HANDYMAN_NOTES_WORKSHEET).toMatch(/Materials Reimbursement/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 7–9", () => {
    const core = HANDYMAN_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Services, Skills, and DO-NOT-DO Boundaries",
      "Check Licensing, Permits, and Insurance Requirements",
      "Set Service Area, Job Minimums, and Pricing",
      "Build Client Intake and Decide If the Job Fits",
      "Estimate Labor, Materials, Travel, and Give a Clear Quote",
      "Confirm Scope, Approval, Schedule, Access, and Change Orders",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Perform Approved Work Safely, Clean Up, and Collect Payment",
      "Track Profit, Testimonials, and Repeat Punch-List Work",
    ]);
    expect(core[0]?.desc).toMatch(/DO-NOT-DO/i);
    expect(core[6]?.desc).toMatch(/pick only 2 or 3/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
  });

  it("uses handyman calculator: $1,100 revenue, $240 expenses, $860 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Handyman Services");
    expect(profile.title).toMatch(/handyman profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "handymanSmallJobs")).toBe(true);

    const helper = computeHandymanProfit({
      handymanSmallJobs: 4,
      smallJobPrice: 75,
      hourlyHours: 6,
      hourlyRate: 50,
      punchListJobs: 2,
      punchListPrice: 150,
      dayProjects: 1,
      dayProjectPrice: 150,
      addOnRevenue: 50,
      materialReimbursements: 80,
      unreimbursedMaterials: 40,
      toolConsumables: 15,
      fuelTravel: 40,
      disposal: 10,
      helperLabor: 0,
      insuranceAllocation: 50,
      paymentFees: 25,
      advertising: 30,
      software: 10,
      otherExpenses: 20,
      laborHours: 20,
      jobsCompleted: 8,
    });
    expect(helper.grossServiceRevenue).toBe(1100);
    expect(helper.materialReimbursements).toBe(80);
    expect(helper.totalExpenses).toBe(240);
    expect(helper.estimatedProfit).toBe(860);

    const result = computeGuideCalc(
      profile.mode,
      {
        handymanSmallJobs: 4,
        smallJobPrice: 75,
        hourlyHours: 6,
        hourlyRate: 50,
        punchListJobs: 2,
        punchListPrice: 150,
        dayProjects: 1,
        dayProjectPrice: 150,
        addOnRevenue: 50,
        materialReimbursements: 80,
        unreimbursedMaterials: 40,
        toolConsumables: 15,
        fuelTravel: 40,
        disposal: 10,
        helperLabor: 0,
        insuranceAllocation: 50,
        paymentFees: 25,
        advertising: 30,
        software: 10,
        otherExpenses: 20,
        laborHours: 20,
        jobsCompleted: 8,
      },
      [],
    );
    expect(result.revenue).toBe(1100);
    expect(result.expenses).toBe(240);
    expect(result.net).toBe(860);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Handyman Services");
    expect(pdf.steps.some((s) => /define services, skills, and do-not-do/i.test(s.title))).toBe(true);
  });
});
