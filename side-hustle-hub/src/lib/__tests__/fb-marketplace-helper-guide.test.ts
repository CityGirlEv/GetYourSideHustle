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
  FB_MARKETPLACE_HELPER_DETAILED_STEPS,
  FB_MARKETPLACE_HELPER_NOTES_WORKSHEET,
  FB_MARKETPLACE_HELPER_PRICING,
  FB_MARKETPLACE_HELPER_REALITY_CHECK,
  FB_MARKETPLACE_HELPER_SUPPLIES,
  FB_MARKETPLACE_HELPER_TOOLS,
  computeFbMarketplaceHelperProfit,
  fbMarketplaceHelperToolsDisclaimer,
} from "../fb-marketplace-helper-guide";

const GUIDE_ID = "fb-marketplace-helper";

describe("Guide #067 Facebook Marketplace Listing Helper", () => {
  it("keeps a single #067 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("067");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("067");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Facebook Marketplace Listing Helper");
    expect(h.name).not.toMatch(/guide upgrade|marketplace guide|listing guide|selling assistant|starter guide|member guide/i);
    expect(h.category).toBe("Local Services / Online Selling Assistance");
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/owner keeps control of the account/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps client sale proceeds out of helper revenue", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? FB_MARKETPLACE_HELPER_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/\$15 – \$25/);
    expect(intro).toMatch(/\$35 – \$60/);
    expect(intro).toMatch(/CLIENT SALE PROCEEDS/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /measuring tape/i.test(i.name))).toBe(true);
    expect(FB_MARKETPLACE_HELPER_SUPPLIES.starterKitTotal).toMatch(/\$0–40/);
    expect(FB_MARKETPLACE_HELPER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => t.id === "google_docs")).toBe(true);
    expect(fbMarketplaceHelperToolsDisclaimer()).toMatch(/never collect passwords/i);
    expect(FB_MARKETPLACE_HELPER_REALITY_CHECK.title).toMatch(/do not take over/i);
    expect(FB_MARKETPLACE_HELPER_REALITY_CHECK.body).toMatch(/Turn Clutter Into Clear Listings/i);
    expect(FB_MARKETPLACE_HELPER_NOTES_WORKSHEET).toMatch(/ITEM WORKSHEET/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = FB_MARKETPLACE_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Your Service & Account Boundaries",
      "Set Your Packages, Prices & Written Terms",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Screen the Client, Items & Work Area",
      "Inventory Items & Research Asking Prices",
      "Photograph Each Item & Write the Listing",
      "Get Owner Approval & Publish Safely",
      "Manage Approved Messages, Pickup & Project Profit",
      "Refresh, Close Out, Ask for a Review & Rebook",
    ]);
    expect(core[0]?.desc).toMatch(/do not collect passwords/i);
    expect(core[2]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[8]?.desc).toMatch(/APPROVED for Item/i);
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
    expect(titles.filter((t) => /refresh, close out, ask for a review/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /^ask for a short review$/i.test(t))).toHaveLength(1);
  });

  it("uses monthly listing-helper calculator: $470 revenue, $50 expenses, $420 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Facebook Marketplace Listing Helper");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "fbMarketplaceProjects")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const helper = computeFbMarketplaceHelperProfit({
      fbMarketplaceProjects: 6,
      averageBaseProjectFee: 65,
      listingRefreshIncome: 40,
      complexResearchIncome: 15,
      buyerMessageSupportIncome: 15,
      rushTravelAddOnIncome: 10,
      otherEarnedServiceIncome: 0,
      supplies: 10,
      mileageTransportation: 20,
      parking: 5,
      softwarePhone: 5,
      advertisingPrinting: 5,
      paymentFees: 5,
      otherExpenses: 0,
      clientSessionHours: 12,
      travelHours: 4,
      researchWritingPostingHours: 6,
      messageFollowUpAdminHours: 2,
    });
    expect(helper.baseRevenue).toBe(390);
    expect(helper.grossServiceRevenue).toBe(470);
    expect(helper.totalExpenses).toBe(50);
    expect(helper.estimatedProfit).toBe(420);
    expect(helper.totalHours).toBe(24);
    expect(helper.profitPerHour).toBe(17.5);

    const result = computeGuideCalc(
      profile.mode,
      {
        fbMarketplaceProjects: 6,
        averageBaseProjectFee: 65,
        listingRefreshIncome: 40,
        complexResearchIncome: 15,
        buyerMessageSupportIncome: 15,
        rushTravelAddOnIncome: 10,
        otherEarnedServiceIncome: 0,
        supplies: 10,
        mileageTransportation: 20,
        parking: 5,
        softwarePhone: 5,
        advertisingPrinting: 5,
        paymentFees: 5,
        otherExpenses: 0,
        clientSessionHours: 12,
        travelHours: 4,
        researchWritingPostingHours: 6,
        messageFollowUpAdminHours: 2,
      },
      [],
    );
    expect(result.revenue).toBe(470);
    expect(result.expenses).toBe(50);
    expect(result.net).toBe(420);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Facebook Marketplace Listing Helper");
    expect(pdf.steps.some((s) => /define your service & account boundaries/i.test(s.title))).toBe(true);
  });
});
