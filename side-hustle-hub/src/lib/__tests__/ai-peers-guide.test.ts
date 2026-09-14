import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier, seniorGuideMinTier } from "../guide-access";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  AI_PEERS_DETAILED_STEPS,
  AI_PEERS_NOTES_WORKSHEET,
  AI_PEERS_PRICING,
  AI_PEERS_REALITY_CHECK,
  AI_PEERS_SUPPLIES,
  AI_PEERS_TOOLS,
  computeAiPeersProfit,
  aiPeersToolsDisclaimer,
} from "../ai-peers-guide";

const GUIDE_ID = "ai-peers";

describe("Guide #028 AI-for-Peers Coffee Chat", () => {
  it("keeps a single #028 id, exact title, Elite, 2–8 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("028");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("028");
    const idsFor028 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "028")
      .map(([id]) => id);
    expect(idsFor028).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("AI-for-Peers Coffee Chat");
    expect(h.name).not.toMatch(/guide upgrade|coffee chat guide|elite guide|member guide/i);
    expect(h.category).toBe("AI / Education");
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.audiences).toContain("senior");
    expect(h.audiences).not.toContain("junior");
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/office hours pace/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(seniorGuideMinTier("ai-peer-class", GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing with 1:1, small-group, private group, workshop, and series examples", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? AI_PEERS_PRICING.intro);
    expect(intro).toMatch(/\$20–\$50/);
    expect(intro).toMatch(/\$10–\$30/);
    expect(intro).toMatch(/\$75–\$250/);
    expect(intro).toMatch(/\$150–\$500/);
    expect(intro).toMatch(/revenue is not profit/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.suggestedPricing?.items.some((i) => /1:1 beginner/i.test(i.label))).toBe(true);
    expect(kit.supplies?.items.some((i) => /laptop|tablet/i.test(i.name))).toBe(true);
    expect(AI_PEERS_SUPPLIES.starterKitTotal).toMatch(/\$0–25/);
    expect(AI_PEERS_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(aiPeersToolsDisclaimer()).toMatch(/never request or record passwords/i);
    expect(AI_PEERS_REALITY_CHECK.title).toMatch(/not an ai engineer/i);
    expect(AI_PEERS_NOTES_WORKSHEET).toMatch(/Participant\/Organization/i);
    expect(AI_PEERS_NOTES_WORKSHEET).toMatch(/ELITE CHALLENGE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = AI_PEERS_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose the Beginner AI Topics You Can Confidently Teach",
      "Choose Your Session Format and Audience",
      "Build a Simple No-Jargon Coffee-Chat Lesson",
      "Create Pricing and Session Options",
      "Prepare Demonstrations, Handouts and Safety Examples",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Host the Session at an Office-Hours Pace",
      "Give Participants Practice Time and Answer Questions",
      "Collect Feedback, Track Profit and Offer the Next Learning Step",
    ]);
    expect(core[2]?.desc).toMatch(/WELCOME → ASK GOALS/i);
    expect(core[4]?.desc).toMatch(/AI DRAFT → HUMAN REVIEW → FACT CHECK/i);
    expect(core[5]?.desc).toMatch(/Curious about ChatGPT but don.t want a tech lecture/i);
    expect(core[8]?.desc).toMatch(/never request or record passwords/i);

    for (const step of core) {
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

  it("uses Coffee Chat Profit Calculator: $80 revenue, $20 expenses, $60 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "AI-for-Peers Coffee Chat");
    expect(profile.title).toMatch(/coffee chat profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "aiPeersOneOnOneSessions")).toBe(true);

    const result = computeGuideCalc(
      "service",
      {
        aiPeersOneOnOneSessions: 2,
        aiPeersOneOnOneRate: 40,
        aiPeersSmallGroupParticipants: 0,
        aiPeersSmallGroupPricePerPerson: 0,
        aiPeersPrivateGroupSessions: 0,
        aiPeersPrivateGroupFee: 0,
        aiPeersWorkshopSessions: 0,
        aiPeersWorkshopFee: 0,
        aiPeersSeriesRevenue: 0,
        aiPeersAddOnRevenue: 0,
        aiPeersVenueCost: 0,
        aiPeersPrintingCost: 0,
        aiPeersSoftwareSubscriptions: 0,
        aiPeersTravelParking: 0,
        aiPeersPaymentFees: 0,
        aiPeersAds: 0,
        aiPeersHostPaidRefreshments: 0,
        aiPeersOtherExpenses: 20,
        aiPeersTeachingHours: 2,
        aiPeersPrepHours: 2,
        aiPeersTravelHours: 0,
        aiPeersSetupCleanupHours: 0,
        aiPeersFollowUpAdminHours: 0,
      },
      [],
    );
    expect(result.revenue).toBe(80);
    expect(result.expenses).toBe(20);
    expect(result.net).toBe(60);
    expect(result.metrics?.netPerHour).toBe(15);
    expect(result.notes.join(" ")).toMatch(/examples only/i);

    const helper = computeAiPeersProfit({
      aiPeersOneOnOneSessions: 2,
      aiPeersOneOnOneRate: 40,
      aiPeersOtherExpenses: 20,
      aiPeersTeachingHours: 2,
      aiPeersPrepHours: 2,
    });
    expect(helper.oneOnOneRevenue).toBe(80);
    expect(helper.grossRevenue).toBe(80);
    expect(helper.totalExpenses).toBe(20);
    expect(helper.estimatedProfit).toBe(60);
    expect(helper.profitPerHour).toBe(15);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("AI-for-Peers Coffee Chat");
    expect(pdf.pricing?.some((p) => /\$20|\$10–\$30|1:1/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /beginner ai topics you can confidently teach/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /choose your marketing channels/i.test(s.title))).toBe(true);
  });
});
