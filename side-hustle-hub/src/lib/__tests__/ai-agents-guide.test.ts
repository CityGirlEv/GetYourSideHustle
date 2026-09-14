import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { resolveLaunchGuideData } from "../resolve-launch-guide-data";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  AI_AGENTS_DETAILED_STEPS,
  AI_AGENTS_NOTES_WORKSHEET,
  AI_AGENTS_REALITY_CHECK,
  computeAiAgentsProfit,
} from "../ai-agents-guide";

const GUIDE_ID = "ai-agents";

describe("Guide #022 AI Agents for Side Hustlers", () => {
  it("keeps a single #022 id, exact title, Elite, 2–4 weeks, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("022");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("022");
    const idsFor022 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "022")
      .map(([id]) => id);
    expect(idsFor022).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("AI Agents for Side Hustlers");
    expect(h.name).not.toMatch(/guide upgrade|ai agent guide|elite guide|member guide/i);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toBe("AI Services / Automation / Business Support");
    expect(h.timeReq).toMatch(/2\s*-\s*4 weeks/i);
    expect(h.potentialIncome).toMatch(/\$1,000/);
    expect(h.potentialIncome).toMatch(/examples only/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior", "junior"]));
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");

    const data = resolveLaunchGuideData(GUIDE_ID, []);
    expect(data.name).toBe("AI Agents for Side Hustlers");
    expect(data.timeframe).toMatch(/2\s*-\s*4 weeks/i);
    expect(data.estEarnings).toMatch(/\$1,000/);
    expect(data.estEarnings).toMatch(/not guarantees/i);
  });

  it("ships COMPLETE tools, replaced pricing, supplies, and notes", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /zapier/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /credential manager/i.test(t.name))).toBe(true);
    expect(kit.supplies?.starterKitTotal).toMatch(/\$0–25/i);
    expect(kit.supplies?.items.some((i) => /workflow map/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /testing checklist/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /secure credential/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /crm sandbox/i.test(i.name) && i.optional)).toBe(true);
    expect(JSON.stringify(kit.supplies)).toMatch(/never collect passwords in plain text/i);

    const intro = Array.isArray(kit.suggestedPricing?.intro)
      ? kit.suggestedPricing.intro.join("\n")
      : String(kit.suggestedPricing?.intro ?? "");
    expect(intro).toMatch(/STARTER OFFER/i);
    expect(intro).toMatch(/\$150–\$400/);
    expect(intro).toMatch(/STANDARD CUSTOM AGENT/i);
    expect(intro).toMatch(/\$400–\$1,500/);
    expect(intro).toMatch(/MONTHLY SUPPORT/i);
    expect(intro).toMatch(/\$100–\$1,000/);

    expect(AI_AGENTS_REALITY_CHECK.title).toMatch(/sell a solved business problem/i);
    expect(AI_AGENTS_NOTES_WORKSHEET).toMatch(/MY AI AGENT OFFER/i);
    expect(AI_AGENTS_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = AI_AGENTS_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/choose one business problem/i);
    expect(core[1]?.title).toMatch(/map the current workflow/i);
    expect(core[2]?.title).toMatch(/define agent scope/i);
    expect(core[3]?.title).toMatch(/build the first working version/i);
    expect(core[4]?.title).toMatch(/test with realistic examples/i);
    expect(core[5]?.title).toMatch(/choose your marketing channels/i);
    expect(core[6]?.title).toMatch(/make your marketing materials/i);
    expect(core[7]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[8]?.title).toMatch(/deploy with human review/i);
    expect(core[9]?.title).toMatch(/monitor, fix/i);
    expect(core[10]?.title).toMatch(/repeatable offer/i);
    expect(core[7]?.desc).toMatch(/discovery call/i);
    expect(core[8]?.desc).toMatch(/human approval/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
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

  it("uses Agent Profit Calculator: $2,850 revenue, $2,200 profit, ≈$31.43/hour", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "AI Agents for Side Hustlers");
    expect(profile.title).toMatch(/agent profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "starterBuilds")).toBe(true);

    const helper = computeAiAgentsProfit({
      starterBuilds: 1,
      starterPrice: 300,
      standardBuilds: 2,
      standardPrice: 900,
      monthlyRetainers: 3,
      retainerPrice: 250,
      aiApiCosts: 200,
      automationTools: 150,
      hostingDatabase: 50,
      contractors: 100,
      software: 50,
      paymentFees: 50,
      marketing: 50,
      otherExpenses: 0,
      buildHours: 40,
      testingHours: 12,
      supportHours: 10,
      salesAdminHours: 8,
    });
    expect(helper.monthlyRevenue).toBe(2850);
    expect(helper.monthlyExpenses).toBe(650);
    expect(helper.monthlyProfit).toBe(2200);
    expect(helper.totalHours).toBe(70);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(31.43, 2);

    const result = computeGuideCalc(
      profile.mode,
      {
        starterBuilds: 1,
        starterPrice: 300,
        standardBuilds: 2,
        standardPrice: 900,
        monthlyRetainers: 3,
        retainerPrice: 250,
        aiApiCosts: 200,
        automationTools: 150,
        hostingDatabase: 50,
        contractors: 100,
        software: 50,
        paymentFees: 50,
        marketing: 50,
        otherExpenses: 0,
        buildHours: 40,
        testingHours: 12,
        supportHours: 10,
        salesAdminHours: 8,
      },
      [],
    );
    expect(result.revenue).toBe(2850);
    expect(result.expenses).toBe(650);
    expect(result.net).toBe(2200);
    expect(result.metrics?.netPerHour).toBeCloseTo(31.43, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("AI Agents for Side Hustlers");
    expect(pdf.steps.some((s) => /choose one business problem/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /repeatable offer/i.test(s.title))).toBe(true);
  });
});
