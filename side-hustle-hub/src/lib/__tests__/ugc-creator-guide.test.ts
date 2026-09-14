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
  UGC_CREATOR_DETAILED_STEPS,
  UGC_CREATOR_NOTES_WORKSHEET,
  UGC_CREATOR_PRICING,
  UGC_CREATOR_REALITY_CHECK,
  UGC_CREATOR_SUPPLIES,
  UGC_CREATOR_TOOLS,
  computeUgcCreatorProfit,
  ugcCreatorToolsDisclaimer,
} from "../ugc-creator-guide";

const GUIDE_ID = "ugc-creator";

describe("Guide #112 UGC Creator", () => {
  it("keeps a single #112 id, exact title, Starter, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("112");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("112");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("UGC Creator");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Creative Services / User-Generated-Style Content");
    expect(h.timeReq).toMatch(/3 - 10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult"]));
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/license|product/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps rights / honest-claims copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? UGC_CREATOR_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/usage rights/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /phone|camera|light/i.test(i.name))).toBe(true);
    expect(UGC_CREATOR_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(UGC_CREATOR_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(ugcCreatorToolsDisclaimer()).toMatch(/never fake testimonials/i);
    expect(UGC_CREATOR_REALITY_CHECK.title).toMatch(/content license/i);
    expect(UGC_CREATOR_NOTES_WORKSHEET).toMatch(/CLIENT \/ PRODUCT/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = UGC_CREATOR_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the UGC Format & Product Category",
      "Build the Package, Price & Rights Menu",
      "Create the Portfolio & Client System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Qualify the Brand, Product & Brief",
      "Script, Plan & Approve the Concept",
      "Film & Edit the Content",
      "Quality-Check, Revise & Deliver",
      "Close, Track Rights & Rebook",
    ]);
    expect(core[0]?.desc).toMatch(/format/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3|choose only 2 or 3/i);
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

  it("uses monthly calculator: $700 revenue, $125 expenses, $575 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "UGC Creator");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "ugcVideosDelivered")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      ugcVideosDelivered: 4,
      averageProductionFee: 125,
      usageRightsRevenue: 120,
      rawFootageAddOnRevenue: 50,
      whitelistingExclusivityRevenue: 30,
      otherEarnedIncome: 0,
      productsPropsNotReimbursed: 40,
      equipmentSoftwareAssets: 40,
      shippingTravel: 15,
      paymentFees: 15,
      insuranceProfessionalServices: 10,
      otherExpenses: 5,
      salesBriefsHours: 4,
      conceptScriptHours: 4,
      filmingHours: 8,
      editingHours: 8,
      revisionsDeliveryAdminHours: 4,
    };
    const helper = computeUgcCreatorProfit(example);
    expect(helper.baseProductionRevenue).toBe(500);
    expect(helper.grossServiceRevenue).toBe(700);
    expect(helper.totalExpenses).toBe(125);
    expect(helper.estimatedProfit).toBe(575);
    expect(helper.totalHours).toBe(28);
    expect(helper.profitPerHour).toBeCloseTo(20.54, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(700);
    expect(result.expenses).toBe(125);
    expect(result.net).toBe(575);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("UGC Creator");
    expect(pdf.steps.some((s) => /ugc format/i.test(s.title))).toBe(true);
  });
});
