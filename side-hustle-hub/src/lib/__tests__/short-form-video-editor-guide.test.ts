import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  SHORT_FORM_VIDEO_DETAILED_STEPS,
  SHORT_FORM_VIDEO_NOTES_WORKSHEET,
  SHORT_FORM_VIDEO_PRICING,
  SHORT_FORM_VIDEO_REALITY_CHECK,
  SHORT_FORM_VIDEO_SUPPLIES,
  SHORT_FORM_VIDEO_TOOLS,
  computeShortFormVideoEditorProfit,
  shortFormVideoEditorToolsDisclaimer,
} from "../short-form-video-editor-guide";

const GUIDE_ID = "short-form-video-editor";

describe("Guide #102 Short-Form Video Editor", () => {
  it("keeps a single #102 id, exact title, Starter, 3 - 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("102");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("102");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Short-Form Video Editor");
    expect(h.name).not.toMatch(/guide upgrade|member guide/i);
    expect(h.category).toBe("Creative Services / Short-Form Video Editing");
    expect(h.timeReq).toMatch(/3 - 10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult"]));
    expect(h.audiences).not.toContain("senior");
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/vertical|footage|clip/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps rights-and-goal copy", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? SHORT_FORM_VIDEO_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.length).toBeGreaterThan(0);
    expect(SHORT_FORM_VIDEO_SUPPLIES.starterKitTotal).toMatch(/\$0/);
    expect(SHORT_FORM_VIDEO_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(shortFormVideoEditorToolsDisclaimer()).toMatch(/rights|music|views/i);
    expect(SHORT_FORM_VIDEO_REALITY_CHECK.title).toMatch(/goal, platform & rights/i);
    expect(SHORT_FORM_VIDEO_NOTES_WORKSHEET).toMatch(/footage authorized/i);
    expect(kit.prerequisites.some((p) => p.id === "parent")).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = SHORT_FORM_VIDEO_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Client, Platform & Edit Type",
      "Build the Package, Price & Agreement",
      "Build the Editing & File System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Intake, Verify Rights & Organize Source Files",
      "Build the Rough Cut",
      "Add Captions, Graphics, Audio & Accessibility",
      "Quality-Check, Revise & Deliver",
      "Close, Track Profit & Rebook",
    ]);
    expect(core[0]?.desc).toMatch(/platform|edit/i);
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

  it("uses monthly calculator: $400 revenue, $65 expenses, $335 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Short-Form Video Editor");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "shortFormClipsCompleted")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const example = {
      shortFormClipsCompleted: 8,
      averageFeePerClip: 40,
      captionGraphicsAddOnRevenue: 80,
      editingSoftware: 15,
      storageTransfer: 10,
      licensedMusicStockFonts: 10,
      equipmentAllocation: 10,
      phoneInternet: 10,
      paymentFeesAdvertising: 10,
      salesIntakeHours: 2,
      sourceReviewHours: 3,
      editingHours: 8,
      captionsGraphicsAudioHours: 4,
      revisionsExportsHours: 2,
      deliveryAdminHours: 1,
    };
    const helper = computeShortFormVideoEditorProfit(example);
    expect(helper.baseClipRevenue).toBe(320);
    expect(helper.grossServiceRevenue).toBe(400);
    expect(helper.totalExpenses).toBe(65);
    expect(helper.estimatedProfit).toBe(335);
    expect(helper.totalHours).toBe(20);
    expect(helper.profitPerHour).toBeCloseTo(16.75, 2);

    const result = computeGuideCalc(profile.mode, example, []);
    expect(result.revenue).toBe(400);
    expect(result.expenses).toBe(65);
    expect(result.net).toBe(335);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Short-Form Video Editor");
    expect(pdf.steps.some((s) => /choose the client, platform/i.test(s.title))).toBe(true);
  });
});
