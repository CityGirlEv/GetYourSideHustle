import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  AI_ASSETS_DETAILED_STEPS,
  AI_ASSETS_NOTES_WORKSHEET,
  AI_ASSETS_PRICING,
  AI_ASSETS_REALITY_CHECK,
  AI_ASSETS_SUPPLIES,
  AI_ASSETS_TOOLS,
  aiAssetsToolsDisclaimer,
  computeAiAssetsProfit,
} from "../ai-assets-guide";

const GUIDE_ID = "ai-assets";

describe("Guide #023 AI Asset Studio", () => {
  it("keeps a single #023 id, exact title, Elite, 8 - 15 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("023");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("023");
    const idsFor023 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "023")
      .map(([id]) => id);
    expect(idsFor023).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("AI Asset Studio");
    expect(h.name).not.toMatch(/guide upgrade|ai asset creation|ai designer|logo generator|elite guide|member guide/i);
    expect(h.category).toBe("AI / Creative");
    expect(h.timeReq).toMatch(/8\s*-\s*15 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$500/);
    expect(h.potentialIncome).toMatch(/\$5,000/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships COMPLETE kit data: reality check, notes, pricing, supplies, beginner stack", () => {
    expect(AI_ASSETS_REALITY_CHECK.title).toMatch(/does not automatically mean exclusive/i);
    expect(AI_ASSETS_NOTES_WORKSHEET).toMatch(/ASSET MANIFEST/i);
    expect(AI_ASSETS_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(AI_ASSETS_PRICING.intro).toMatch(/\$500 - \$5,000\/mo/i);
    expect(AI_ASSETS_PRICING.intro).toMatch(/starter asset pack/i);
    expect(AI_ASSETS_PRICING.intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(AI_ASSETS_SUPPLIES.items.some((i) => /manifest|editor|ai generation/i.test(i.name))).toBe(true);
    expect(AI_ASSETS_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(aiAssetsToolsDisclaimer()).toMatch(/asset manifest/i);
    expect(aiAssetsToolsDisclaimer()).toMatch(/do not promise automatic copyright/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 5–7", () => {
    const core = AI_ASSETS_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose One Client Niche and Asset Pack",
      "Define the Deliverable, Rights, and Price",
      "Build the Brief and Provenance System",
      "Create Three Honest Portfolio Samples",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Qualify the Client and Inputs",
      "Develop Directions and Get Approval",
      "Human-Edit and Production-Check",
      "Deliver with Manifest, Close & Rebook",
    ]);
    expect(core[4]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[5]?.desc).toMatch(/do not market/i);
    expect(core[6]?.desc).toMatch(/track:/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    expect(core.filter((s) => /choose your marketing channels/i.test(s.title))).toHaveLength(1);
    expect(core.filter((s) => /make your marketing materials/i.test(s.title))).toHaveLength(1);
    expect(core.filter((s) => /carry out your marketing plan/i.test(s.title))).toHaveLength(1);
  });

  it("uses monthly calculator: $1,500 revenue, $250 expenses, $1,250 profit, $22.73/hr", () => {
    const example = computeAiAssetsProfit({
      aaStarterPacks: 4,
      aaAvgStarterFee: 150,
      aaCampaignKitRevenue: 0,
      aaRetainerRevenue: 900,
      aaAddOnRevenue: 0,
      aaOtherRevenue: 0,
      aaAiDesignSubscriptions: 80,
      aaLicensedInputs: 50,
      aaStorageHardware: 30,
      aaContractorsReview: 0,
      aaPaymentFeesRefunds: 40,
      aaInsuranceOther: 50,
      aaBriefResearchHours: 10,
      aaGenerationConceptHours: 15,
      aaHumanEditExportHours: 20,
      aaRevisionAdminMarketingHours: 10,
      aaFinalAssetsDelivered: 20,
    });
    expect(example.starterPackRevenue).toBe(600);
    expect(example.totalCollectedRevenue).toBe(1500);
    expect(example.totalExpenses).toBe(250);
    expect(example.estimatedProfit).toBe(1250);
    expect(example.totalHours).toBe(55);
    expect(example.profitPerHour).toBeCloseTo(22.73, 2);
    expect(example.revenuePerAsset).toBe(75);
  });

  it("Download PDF model matches the upgraded on-screen kit title", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("AI Asset Studio");
    expect(AI_ASSETS_DETAILED_STEPS.some((s) => /niche and asset pack/i.test(s.title))).toBe(true);
  });
});
