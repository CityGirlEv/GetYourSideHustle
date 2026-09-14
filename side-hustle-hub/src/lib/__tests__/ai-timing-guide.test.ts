import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { LAUNCH_GUIDES } from "../launch-guides";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  AI_TIMING_DETAILED_STEPS,
  AI_TIMING_EXTERNAL_LINKS,
  AI_TIMING_NOTES_WORKSHEET,
  AI_TIMING_PREREQUISITE_EXTRAS,
  AI_TIMING_PRICING,
  AI_TIMING_REALITY_CHECK,
  AI_TIMING_SUPPLIES,
  AI_TIMING_TOOLS,
  aiTimingToolsDisclaimer,
  computeAiTimingProfit,
} from "../ai-timing-guide";

const GUIDE_ID = "ai-timing";

describe("Guide #027 AI Rideshare Timing Scout", () => {
  it("keeps a single #027 id, exact title, Elite, 1–2 weeks, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("027");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("027");
    const idsFor027 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "027")
      .map(([id]) => id);
    expect(idsFor027).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(LAUNCH_GUIDES.find((g) => g.id === GUIDE_ID)?.name).toBe("AI Rideshare Timing Scout");
    expect(h.name).toBe("AI Rideshare Timing Scout");
    expect(h.name).not.toMatch(
      /guide upgrade|rideshare guide|timing guide|ai driver guide|elite guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.audiences).not.toContain("junior");
    expect(h.timeReq).toMatch(/1\s*-\s*2 weeks/i);
    expect(h.category).toMatch(/AI Services\s*\/\s*Rideshare & Delivery\s*\/\s*Local Data/i);
    expect(h.potentialIncome).toMatch(/\$300/);
    expect(h.potentialIncome).toMatch(/\$3,000/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(FREE_WIZARD_HUSTLE_IDS).toHaveLength(20);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships COMPLETE kit: two income paths, no invented live demand, and beginner stack", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(AI_TIMING_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(AI_TIMING_TOOLS.some((t) => /maps/i.test(t.name))).toBe(true);
    expect(AI_TIMING_TOOLS.some((t) => /sheets|excel/i.test(t.name))).toBe(true);
    expect(AI_TIMING_TOOLS.some((t) => /event/i.test(t.name))).toBe(true);
    expect(AI_TIMING_TOOLS.some((t) => /mileage/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(AI_TIMING_SUPPLIES.starterKitTotal).toMatch(/\$0–25/i);
    expect(AI_TIMING_SUPPLIES.items.some((i) => /observation/i.test(i.name))).toBe(true);
    expect(AI_TIMING_SUPPLIES.items.some((i) => /disclaimer/i.test(i.name))).toBe(true);
    expect(AI_TIMING_SUPPLIES.items.some((i) => /weather/i.test(i.name) && i.optional)).toBe(true);
    expect(AI_TIMING_EXTERNAL_LINKS.some((l) => /chatgpt/i.test(l.label))).toBe(true);
    expect(aiTimingToolsDisclaimer()).toMatch(/beginner stack/i);
    expect(aiTimingToolsDisclaimer()).toMatch(/not guaranteed/i);
    expect(AI_TIMING_REALITY_CHECK.title).toMatch(/timing scout, not a guaranteed-earnings system/i);
    expect(AI_TIMING_REALITY_CHECK.body).toMatch(/never invent/i);
    expect(AI_TIMING_REALITY_CHECK.body).not.toMatch(/GUIDE UPGRADE/i);
    expect(AI_TIMING_NOTES_WORKSHEET).toMatch(/MY AI RIDESHARE TIMING SCOUT PLAN/i);
    expect(AI_TIMING_NOTES_WORKSHEET).toMatch(/ELITE CHALLENGE/i);
    expect(AI_TIMING_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(AI_TIMING_PREREQUISITE_EXTRAS.some((p) => /two income paths/i.test(p.label))).toBe(true);
    const intro = Array.isArray(kit.suggestedPricing?.intro)
      ? kit.suggestedPricing.intro.join("\n")
      : String(kit.suggestedPricing?.intro ?? "");
    expect(intro).toMatch(/\$300 – \$3,000\+/);
    expect(intro).toMatch(/examples only, NOT guarantees/i);
    expect(intro).toMatch(/USE THE PLAYBOOK YOURSELF/i);
    expect(intro).toMatch(/SELL LOCAL TIMING RESEARCH/i);
    expect(intro).not.toMatch(/\$49–149/);
    expect(kit.suggestedPricing?.items.some((i) => /\$15–\$35/.test(i.price))).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 8–10", () => {
    const core = AI_TIMING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define the Market",
      "Map Demand Generators",
      "Build a Time-Window Matrix",
      "Add Local Calendar & Event Signals",
      "Use AI to Create Testable Hypotheses",
      "Test the Playbook Safely",
      "Analyze Profit, Not Just Gross Earnings",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Update the Playbook & Build Recurring Value",
    ]);
    expect(core[4]?.desc).toMatch(/do not invent live surge/i);
    expect(core[5]?.desc).toMatch(/never use the phone unsafely/i);
    expect(core[6]?.desc).toMatch(/tax mileage deduction/i);
    expect(core[7]?.desc).toMatch(/do not spam/i);
    expect(core[9]?.desc).toMatch(/no guaranteed earnings/i);
    expect(core[10]?.desc).toMatch(/RESEARCH → HYPOTHESIS → DRIVE TEST → MEASURE → UPDATE/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      expect(step.title).not.toMatch(/GUIDE UPGRADE/i);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(titles.some((t) => /seasonal revenue calendar/i.test(t))).toBe(false);
  });

  it("uses Timing Scout calculator: $1,500 playbook revenue, $65 expenses, $1,435 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "AI Rideshare Timing Scout");
    expect(profile.title).toMatch(/timing scout profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "snapshotsSold")).toBe(true);

    const helper = computeAiTimingProfit({
      snapshotsSold: 0,
      averageSnapshotPrice: 0,
      cityPlaybooksSold: 10,
      averageCityPrice: 75,
      customPlaybooksSold: 5,
      averageCustomPrice: 150,
      updatesSubscriptions: 0,
      aiSoftware: 20,
      dataTools: 10,
      marketing: 15,
      paymentFees: 20,
      otherExpenses: 0,
      researchHours: 8,
      customizationHours: 4,
      marketingAdminHours: 4,
    });
    expect(helper.cityRevenue).toBe(750);
    expect(helper.customRevenue).toBe(750);
    expect(helper.playbookRevenue).toBe(1500);
    expect(helper.playbookExpenses).toBe(65);
    expect(helper.playbookProfit).toBe(1435);
    expect(helper.totalHours).toBe(16);
    expect(helper.playbookProfitPerHour).toBeCloseTo(89.6875, 4);

    const result = computeGuideCalc(
      profile.mode,
      {
        snapshotsSold: 0,
        averageSnapshotPrice: 0,
        cityPlaybooksSold: 10,
        averageCityPrice: 75,
        customPlaybooksSold: 5,
        averageCustomPrice: 150,
        updatesSubscriptions: 0,
        aiSoftware: 20,
        dataTools: 10,
        marketing: 15,
        paymentFees: 20,
        otherExpenses: 0,
        researchHours: 8,
        customizationHours: 4,
        marketingAdminHours: 4,
        grossDrivingRevenue: 0,
        onlineHours: 0,
        miles: 0,
        fuelCharging: 0,
        tollsParking: 0,
        estimatedVehicleCosts: 0,
        otherDrivingCosts: 0,
      },
      [],
    );
    expect(result.revenue).toBe(1500);
    expect(result.expenses).toBe(65);
    expect(result.net).toBe(1435);
    expect(result.notes.join(" ")).toMatch(/not guaranteed/i);
    expect(result.notes.join(" ")).toMatch(/tax mileage/i);
  });

  it("computes driver-test profit without treating tax mileage as cash", () => {
    const driver = computeAiTimingProfit({
      grossDrivingRevenue: 200,
      onlineHours: 8,
      miles: 100,
      fuelCharging: 30,
      tollsParking: 5,
      estimatedVehicleCosts: 20,
      otherDrivingCosts: 5,
    });
    expect(driver.drivingCosts).toBe(60);
    expect(driver.drivingProfit).toBe(140);
    expect(driver.profitPerOnlineHour).toBe(17.5);
    expect(driver.profitPerMile).toBe(1.4);
    expect(computeAiTimingProfit({}).playbookProfitPerHour).toBeNull();
    expect(computeAiTimingProfit({}).profitPerOnlineHour).toBeNull();
    expect(computeAiTimingProfit({}).profitPerMile).toBeNull();
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("AI Rideshare Timing Scout");
    expect(pdf.steps.some((s) => /define the market/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /update the playbook/i.test(s.title))).toBe(true);
  });
});
