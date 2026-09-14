import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  BASIC_INVITATION_DETAILED_STEPS,
  BASIC_INVITATION_NOTES_WORKSHEET,
  BASIC_INVITATION_PRICING,
  BASIC_INVITATION_REALITY_CHECK,
  BASIC_INVITATION_SUPPLIES,
  BASIC_INVITATION_TOOLS,
  basicInvitationToolsDisclaimer,
  computeBasicInvitationProfit,
} from "../basic-invitation-creator-guide";

const GUIDE_ID = "basic-invitation-creator";

describe("Guide #035 Basic Invitation Creator", () => {
  it("keeps a single #035 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("035");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("035");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Basic Invitation Creator");
    expect(h.name).not.toMatch(/guide upgrade|invitation guide|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples only/i);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and distinguishes revenue from profit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? BASIC_INVITATION_PRICING.intro);
    expect(intro).toMatch(/\$15–\$25/);
    expect(intro).toMatch(/\$25–\$50/);
    expect(intro).toMatch(/revenue is not profit/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.tools.some((t) => t.id === "canva")).toBe(true);
    expect(kit.supplies?.items.some((i) => /cardstock|paper/i.test(i.name) && i.optional)).toBe(true);
    expect(BASIC_INVITATION_SUPPLIES.items.some((i) => /intake checklist/i.test(i.name))).toBe(true);
    expect(BASIC_INVITATION_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(basicInvitationToolsDisclaimer()).toMatch(/canva/i);
    expect(BASIC_INVITATION_REALITY_CHECK.body).toMatch(/copyrighted characters/i);
    expect(BASIC_INVITATION_NOTES_WORKSHEET).toMatch(/RSVP Deadline/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = BASIC_INVITATION_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose Invitation Types, Styles, and Packages",
      "Create Sample Designs and a Small Portfolio",
      "Set Up Client Intake and Collect Event Details",
      "Design the Invitation in Canva, Proof, and Export",
      "Get Client Approval, Revisions, Delivery, and Payment",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Protect Copyright, Licensing, and Client Privacy",
      "Ask for Referrals and Matching Add-Ons",
      "Track Revenue, Profit, and Repeat Business",
    ]);
    expect(core[6]?.desc).toMatch(/Open Canva at https:\/\/www\.canva\.com\//i);
    expect(core[6]?.desc).toMatch(/birthday invitation|party invite/i);
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

  it("uses invitation calculator: $115 revenue, $50 expenses, $65 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Basic Invitation Creator");
    expect(profile.title).toMatch(/invitation profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "templateInvites")).toBe(true);

    const helper = computeBasicInvitationProfit({
      templateInvites: 2,
      templatePrice: 20,
      customDesigns: 1,
      customPrice: 40,
      addOnRevenue: 20,
      rushFees: 10,
      extraRevisionRevenue: 5,
      paidAssets: 15,
      software: 10,
      paymentProcessing: 5,
      advertising: 8,
      testPrinting: 5,
      otherExpenses: 7,
      laborHours: 8,
      projectsCompleted: 3,
    });
    expect(helper.grossRevenue).toBe(115);
    expect(helper.totalExpenses).toBe(50);
    expect(helper.estimatedProfit).toBe(65);

    const result = computeGuideCalc(
      profile.mode,
      {
        templateInvites: 2,
        templatePrice: 20,
        customDesigns: 1,
        customPrice: 40,
        addOnRevenue: 20,
        rushFees: 10,
        extraRevisionRevenue: 5,
        paidAssets: 15,
        software: 10,
        paymentProcessing: 5,
        advertising: 8,
        testPrinting: 5,
        otherExpenses: 7,
        laborHours: 8,
        projectsCompleted: 3,
      },
      [],
    );
    expect(result.revenue).toBe(115);
    expect(result.expenses).toBe(50);
    expect(result.net).toBe(65);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Basic Invitation Creator");
    expect(pdf.steps.some((s) => /design the invitation in canva/i.test(s.title))).toBe(true);
  });
});
