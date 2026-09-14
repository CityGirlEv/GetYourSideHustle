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
  VIRTUAL_ASSISTANT_DETAILED_STEPS,
  VIRTUAL_ASSISTANT_NOTES_WORKSHEET,
  VIRTUAL_ASSISTANT_PRICING,
  VIRTUAL_ASSISTANT_REALITY_CHECK,
  VIRTUAL_ASSISTANT_SUPPLIES,
  VIRTUAL_ASSISTANT_TOOLS,
  computeVirtualAssistantProfit,
  virtualAssistantToolsDisclaimer,
} from "../virtual-assistant-guide";

const GUIDE_ID = "virtual-assistant";

describe("Guide #114 Virtual Assistant", () => {
  it("keeps a single #114 id, exact title, Pro, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("114");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("114");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Virtual Assistant");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Professional Services / Remote Administrative Support");
    expect(h.timeReq).toMatch(/3 - 10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/administrative|inbox|calendar/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps secure-access copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? VIRTUAL_ASSISTANT_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/unsigned proposal|unpaid invoice/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /computer|headset|workspace/i.test(i.name))).toBe(true);
    expect(VIRTUAL_ASSISTANT_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(VIRTUAL_ASSISTANT_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(virtualAssistantToolsDisclaimer()).toMatch(/passwords/i);
    expect(VIRTUAL_ASSISTANT_REALITY_CHECK.title).toMatch(/imperson/i);
    expect(VIRTUAL_ASSISTANT_NOTES_WORKSHEET).toMatch(/CLIENT SNAPSHOT/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(true);
  });

  it("includes exactly 11 authored core steps without injected generic marketing titles", () => {
    const core = VIRTUAL_ASSISTANT_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Tasks You Will and Will Not Offer",
      "Build One Clear Package and Price",
      "Create the Client Operating System",
      "Secure Your Workspace and Access",
      "Create Honest Marketing Materials",
      "Contact Suitable Clients",
      "Qualify the Client and Scope",
      "Onboard and Run a Small Paid Trial",
      "Complete the Work with Checkpoints",
      "Quality-Check and Hand Off",
      "Close, Offboard, and Improve",
    ]);
    expect(core[0]?.desc).toMatch(/tasks you will not offer|starting menu/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /create honest marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /contact suitable clients/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(0);
  });

  it("uses monthly calculator: $440 revenue, $40 expenses, $400 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Virtual Assistant");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "vaStarterTasksCompleted")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      vaStarterTasksCompleted: 4,
      averageStarterTaskFee: 35,
      retainerRevenueCollected: 300,
      specialProjectRevenueCollected: 0,
      approvedAddOnRevenue: 0,
      otherEarnedRevenue: 0,
      softwareSubscriptions: 15,
      equipmentInternetAllocation: 10,
      paymentFees: 5,
      trainingInsuranceProfessionalServices: 5,
      approvedCostsNotReimbursed: 5,
      otherExpenses: 0,
      taskWorkHours: 12,
      meetingsMessagesAdminHours: 4,
      marketingSalesHours: 3,
      revisionReworkHours: 1,
    };
    const helper = computeVirtualAssistantProfit(example);
    expect(helper.starterTaskRevenue).toBe(140);
    expect(helper.grossServiceRevenue).toBe(440);
    expect(helper.totalExpenses).toBe(40);
    expect(helper.estimatedProfit).toBe(400);
    expect(helper.totalHours).toBe(20);
    expect(helper.profitPerHour).toBeCloseTo(20, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(440);
    expect(result.expenses).toBe(40);
    expect(result.net).toBe(400);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Virtual Assistant");
    expect(pdf.steps.some((s) => /tasks you will and will not offer/i.test(s.title))).toBe(true);
  });
});
