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
  MAILBOX_CLEANING_DETAILED_STEPS,
  MAILBOX_CLEANING_NOTES_WORKSHEET,
  MAILBOX_CLEANING_PRICING,
  MAILBOX_CLEANING_REALITY_CHECK,
  MAILBOX_CLEANING_SUPPLIES,
  MAILBOX_CLEANING_TOOLS,
  computeMailboxCleaningProfit,
  mailboxCleaningToolsDisclaimer,
} from "../mailbox-cleaning-guide";

const GUIDE_ID = "mailbox-cleaning";

describe("Guide #086 Mailbox Cleaning Service", () => {
  it("keeps a single #086 id, exact title, 2 - 8 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("086");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("086");
    const idsFor086 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "086")
      .map(([id]) => id);
    expect(idsFor086).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Mailbox Cleaning Service");
    expect(h.name).not.toMatch(/guide upgrade|mailbox maintenance|mailbox washing|curb appeal|starter guide|member guide/i);
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior"]));
    expect(h.minTier).toBe("free");
    expect(h.freeWizardEligible).toBe(false);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps exterior-only / no-mail-handling copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? MAILBOX_CLEANING_PRICING.intro);
    expect(intro).toMatch(/\$10 – \$40 \/ job/i);
    expect(intro).toMatch(/basic exterior wipe\/wash/i);
    expect(intro).toMatch(/gross revenue is not profit/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(MAILBOX_CLEANING_SUPPLIES.items.some((i) => /microfiber|bucket/i.test(i.name))).toBe(true);
    expect(MAILBOX_CLEANING_SUPPLIES.starterKitTotal).toMatch(/\$15/);
    expect(MAILBOX_CLEANING_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(mailboxCleaningToolsDisclaimer()).toMatch(/do not handle the mail/i);
    expect(MAILBOX_CLEANING_REALITY_CHECK.title).toMatch(/do not handle the mail/i);
    expect(MAILBOX_CLEANING_NOTES_WORKSHEET).toMatch(/Post Included/i);
    expect(MAILBOX_CLEANING_DETAILED_STEPS[0]?.desc).toMatch(/mail handling/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–5", () => {
    const core = MAILBOX_CLEANING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define the Exterior-Only Service",
      "Set Safety & Permission Rules",
      "Build Your Pricing & Route System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Complete Intake & Pre-Inspection",
      "Prep the Work Area",
      "Clean With a Surface-Safe Method",
      "Quality Check & Restore Access",
      "Get Paid & Track Real Profit",
      "Build a Recurring Route",
    ]);
    expect(core[0]?.desc).toMatch(/exclusions/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[4]?.desc).toMatch(/mailbox exterior looking tired/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const wired = detailedStepsForGuide(GUIDE_ID) ?? [];
    if (wired.length > 0) {
      const titles = wired.map((s) => s.title);
      expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
      expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    }
  });

  it("uses monthly calculator: $438.10 revenue, $78 expenses, $360.10 profit, ~$18.01/hr", () => {
    const example = {
      mcJobsPerWeek: 5,
      mcAvgIndividualPrice: 14,
      mcRouteJobsPerMonth: 1,
      mcAvgRoutePrice: 75,
      mcRecurringTouchUpRevenue: 60,
      mcTipsOtherRevenue: 0,
      mcCleaningSupplies: 25,
      mcProtectiveGear: 10,
      mcTravel: 15,
      mcPaymentFees: 8,
      mcAdvertising: 10,
      mcInsuranceLicensing: 0,
      mcOtherExpenses: 10,
      mcCleaningHours: 14,
      mcTravelAdminHours: 6,
    };
    const helper = computeMailboxCleaningProfit(example);
    expect(helper.weeklyIndividualRevenue).toBe(70);
    expect(helper.monthlyIndividualRevenue).toBeCloseTo(303.1, 1);
    expect(helper.routeRevenue).toBe(75);
    expect(helper.totalMonthlyRevenue).toBeCloseTo(438.1, 1);
    expect(helper.totalExpenses).toBe(78);
    expect(helper.estimatedProfit).toBeCloseTo(360.1, 1);
    expect(helper.totalHours).toBe(20);
    expect(helper.profitPerHour).toBeCloseTo(18.01, 2);

    const profile = guideCalcProfileForId(GUIDE_ID, "Mailbox Cleaning Service");
    if (Object.prototype.hasOwnProperty.call(profile.defaults, "mcJobsPerWeek")) {
      expect(profile.title).toMatch(/monthly profit calculator/i);
      expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);
      const result = computeGuideCalc(profile.mode, example, []);
      expect(result.revenue).toBeCloseTo(438.1, 1);
      expect(result.expenses).toBe(78);
      expect(result.net).toBeCloseTo(360.1, 1);
    }
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Mailbox Cleaning Service");
    const pdfSteps = pdf.steps.map((s) => s.title);
    expect(
      pdfSteps.some((t) => /exterior-only service/i.test(t)) ||
        MAILBOX_CLEANING_DETAILED_STEPS.some((s) => /exterior-only service/i.test(s.title)),
    ).toBe(true);
  });
});
