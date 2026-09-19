/**
 * Second set of eyes for every GYSH guide — structure, tiers, kits, links.
 * Human review cases live in Testing Portal as GUIDE-REV-* (Sprint 6).
 */

import { describe, expect, it } from "vitest";
import {
  ADULT_GUIDE_MIN_TIER,
  adultGuideMinTier,
  kidsGuideMinTier,
  seniorGuideMinTier,
} from "../guide-access";
import {
  CREATE_GAMES_JUNIOR_STEPS,
  CREATE_GAMES_KIDS_STEPS,
  formatGuideToolLine,
  guideKitForId,
  guideToolsDisclaimer,
  TOOL_CATALOG,
} from "../guide-tools";
import {
  DETAILED_GUIDE_STEPS,
  detailedStepsForGuide,
  isGenericGuideSteps,
} from "../guide-detailed-steps";
import { KIDS_GUIDES, guidesForAudience } from "../kids-guides";
import { LAUNCH_GUIDES } from "../launch-guides";
import { SENIOR_GUIDE_TEASERS } from "../seniors-content";
import {
  AI_SIDE_HUSTLE_ELITE_IDS,
  AI_SIDE_HUSTLE_PRO_IDS,
  FREE_WIZARD_HUSTLE_IDS,
  isAiSideHustle,
  isFreeWizardHustle,
  SIDE_HUSTLES,
} from "../side-hustle-catalog";
import { catalogToLaunchGuideData, hustleById } from "../side-hustle-catalog";
import {
  GUIDE_REVIEW_CASES,
  GUIDE_REVIEW_CATALOG,
  GUIDE_REVIEW_SPRINT,
  guideReviewCaseId,
  isGuideReviewCaseId,
  VT_GUIDES_REVIEW_CASE,
} from "../gysh-guide-review-cases";
import { resolveLaunchGuideData } from "../resolve-launch-guide-data";
import { uniqueGuideLibraryCount } from "../guide-library-pool";
import { suggestedSprintForTest } from "../gysh-sprint-board";
import {
  GUIDE_PREP_REVIEW_TAB_LABELS,
  GUIDE_PREP_REVIEW_TABS_PHRASE,
  guidePrepSectionIds,
} from "../guide-prep-visibility";

const HTTPS = /^https:\/\//i;

function assertNonEmptySteps(
  steps: { title: string; body?: string; desc?: string }[],
  label: string,
) {
  expect(steps.length, `${label} needs steps`).toBeGreaterThanOrEqual(3);
  for (const step of steps) {
    expect(step.title.trim().length, `${label} step title`).toBeGreaterThan(2);
    const body = (step.body ?? step.desc ?? "").trim();
    expect(body.length, `${label} step “${step.title}” body`).toBeGreaterThan(12);
    expect(body.toLowerCase()).not.toMatch(/^gather tools\.?$/);
  }
}

describe("guides review — launch guides", () => {
  it("has unique launch guide ids and free-first ordering", () => {
    const ids = LAUNCH_GUIDES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(adultGuideMinTier(LAUNCH_GUIDES[0].id)).toBe("free");
    const firstPaid = LAUNCH_GUIDES.findIndex((g) => adultGuideMinTier(g.id) !== "free");
    expect(firstPaid).toBeGreaterThan(0);
  });

  it("covers every Free Wizard allowlist id", () => {
    const launchIds = new Set(LAUNCH_GUIDES.map((g) => g.id));
    for (const id of FREE_WIZARD_HUSTLE_IDS) {
      expect(launchIds.has(id), `missing free wizard guide ${id}`).toBe(true);
      expect(isFreeWizardHustle(id)).toBe(true);
      expect(adultGuideMinTier(id)).toBe("free");
    }
  });

  it("every launch guide has name, peek, resolvable body, and a kit", () => {
    for (const g of LAUNCH_GUIDES) {
      expect(g.name.trim().length).toBeGreaterThan(3);
      expect(g.peek.trim().length).toBeGreaterThan(12);
      const kit = guideKitForId(g.id);
      expect(kit.prerequisites.length, `${g.id} prerequisites`).toBeGreaterThan(0);
      expect(kit.tools.length, `${g.id} tools`).toBeGreaterThan(0);
      for (const p of kit.prerequisites) {
        expect(p.label.trim().length).toBeGreaterThan(2);
        expect(p.detail.trim().length).toBeGreaterThan(8);
        expect(p.id, `${g.id} GYSH Free account prereq`).not.toBe("free-member");
        expect(`${p.label} ${p.detail}`, g.id).not.toMatch(/GYSH Free account \(or higher\)/i);
        expect(`${p.label} ${p.detail}`, g.id).not.toMatch(
          /Guides are not public — sign in with at least a Free membership/i,
        );
      }
      for (const tool of kit.tools) {
        expect(tool.name.trim().length).toBeGreaterThan(1);
        expect(tool.costNote.trim().length).toBeGreaterThan(4);
        if (tool.url) expect(tool.url).toMatch(HTTPS);
      }
      for (const link of kit.externalLinks ?? []) {
        expect(link.url).toMatch(HTTPS);
        expect(link.label.trim().length).toBeGreaterThan(1);
      }
      const fromCatalog = hustleById(g.id);
      const data = fromCatalog
        ? catalogToLaunchGuideData(fromCatalog)
        : resolveLaunchGuideData(g.id, []);
      expect(data.id).toBe(g.id);
      assertNonEmptySteps(kit.steps ?? data.steps, g.id);
    }
  });

  it("Airbnb steps name AirDNA with the exact https://www.airdna.co/ link", () => {
    const kit = guideKitForId("airbnb");
    const blob = [
      ...(kit.steps ?? []).map((s) => `${s.title} ${s.desc}`),
      ...(kit.externalLinks ?? []).map((l) => l.url),
      ...kit.tools.map((t) => t.url ?? ""),
    ].join("\n");
    expect(blob).toMatch(/https:\/\/www\.airdna\.co\//);
  });

  it("local free guides include supply lists with estimated costs", () => {
    for (const id of [
      "car-interior-cleanup",
      "dog-walk",
      "yard-help",
      "gift-wrapping",
      "lemonade-stand",
      "leaf-raking",
      "handyman-light",
    ] as const) {
      const kit = guideKitForId(id);
      expect(kit.supplies?.items.length, `${id} supplies`).toBeGreaterThanOrEqual(3);
      expect(kit.supplies!.starterKitTotal.trim().length).toBeGreaterThan(5);
      for (const item of kit.supplies!.items) {
        expect(item.estCost.trim().length, `${id} ${item.id} cost`).toBeGreaterThan(1);
      }
    }
    expect(guideToolsDisclaimer().toLowerCase()).toMatch(/estimates/);
    expect(guideToolsDisclaimer().toLowerCase()).toMatch(/free plan/);
    expect(formatGuideToolLine(TOOL_CATALOG.phone_computer).toLowerCase()).not.toMatch(
      /free plan available/,
    );
    expect(formatGuideToolLine(TOOL_CATALOG.canva).toLowerCase()).toMatch(/free plan/);
  });

  it("service guides start with marketing objectives, materials, then outreach", () => {
    for (const id of [
      "tutoring",
    ] as const) {
      const steps = detailedStepsForGuide(id) ?? [];
      const blob = steps.map((s) => `${s.title} ${s.desc}`).join("\n");
      const titles = steps.map((s) => s.title);
      // Foundation order: Research → Name → marketing plan (youth adds Parent Thumbs Up first).
      expect(titles.some((t) => /pick how you will tell people about your side hustle|decide on marketing objectives|choose your marketing channels/i.test(t)), id).toBe(true);
      const marketingIdx = titles.findIndex((t) =>
        /pick how you will tell people about your side hustle|decide on marketing objectives|choose your marketing channels/i.test(t),
      );
      const researchIdx = titles.findIndex((t) => /research competitors/i.test(t));
      expect(researchIdx, id).toBeGreaterThanOrEqual(0);
      expect(marketingIdx, id).toBeGreaterThan(researchIdx);
      expect(blob, id).toMatch(/make your marketing materials/i);
      expect(blob, id).toMatch(/carry out (the|your) marketing plan/i);
      expect(blob, id).toMatch(/phone|text|flyer/i);
      if (id !== "tutoring") {
        expect(blob, id).toMatch(/facebook\.com\/pages\/create/i);
        expect(blob, id).toMatch(/craigslist\.org/i);
        expect(blob, id).toMatch(/nextdoor\.com/i);
        expect(blob, id).toMatch(/parents|neighbors|colleagues|coworkers/i);
        const carry = steps.find((s) => /carry out (the|your) marketing plan/i.test(s.title));
        expect(carry?.desc, id).toMatch(/☐/);
        expect(carry?.desc, id).toMatch(/Warm contacts/i);
        expect(carry?.desc, id).toMatch(/Track and follow up/i);
      } else {
        expect(blob, id).not.toMatch(/facebook\.com\/pages\/create/i);
      }
    }
  });

  it("Babysitter's Helper / Mother's Helper keeps parent-present 11-step flow", () => {
    expect(DETAILED_GUIDE_STEPS["mothers-helper"]).toHaveLength(11);
    const steps = detailedStepsForGuide("mothers-helper") ?? [];
    const titles = steps.map((s) => s.title).join(" | ");
    expect(titles).toMatch(/Decide How You Can Help/i);
    expect(titles).toMatch(/Set Your Starter Price/i);
    expect(titles).toMatch(/Choose Your Marketing Channels/i);
    expect(titles).toMatch(/Make Your Marketing Materials/i);
    expect(titles).toMatch(/Carry Out Your Marketing Plan/i);
    expect(titles).toMatch(/Get Rebooked/i);
    const blob = steps.map((s) => s.desc).join("\n");
    expect(blob).toMatch(/parent.*remain|remain.*present|parent stays/i);
    expect(blob).toMatch(/trusted|parent-approved|family friends/i);
    expect(blob).toMatch(/Do NOT advertise yourself as providing solo babysitting/i);
  });

  it("Career & Industry Consulting has niche delivery steps after marketing", () => {
    const steps = detailedStepsForGuide("consulting") ?? [];
    const titles = steps.map((s) => s.title).join(" | ");
    expect(titles).toMatch(/Choose Your Marketing Channels/i);
    expect(titles).toMatch(/Make Your Authority & Marketing Materials/i);
    expect(titles).toMatch(/niche|discovery|action plan/i);
  });

  it("folds Canva template pick into Make your marketing materials (no separate open-Canva step)", () => {
    for (const id of [
      "basic-invitation-creator",
      "canva-flyer-creator",
      "greeting-card-creator",
      "dog-walk",
    ] as const) {
      const kit = guideKitForId(id);
      expect(kit.tools.some((t) => t.id === "canva"), `${id} Canva tool`).toBe(true);
      const canvaTool = kit.tools.find((t) => t.id === "canva");
      expect(canvaTool?.url, id).toMatch(/canva\.com/i);

      const titles = (kit.steps ?? []).map((s) => s.title);
      expect(titles.some((t) => /open canva and pick|start a flyer-sized design in canva/i.test(t)), id).toBe(
        false,
      );

      const materials = (kit.steps ?? []).find((s) => /make your marketing materials/i.test(s.title));
      expect(materials?.desc, id).toMatch(/Open Canva at https:\/\/www\.canva\.com\//i);
      expect(materials?.desc, id).toMatch(/Free plan available/i);
      expect(materials?.desc, id).toMatch(/sign in at the link|account you already have/i);
      expect(materials?.desc, id).toMatch(/Search Templates/i);
      expect(materials?.desc, id).toMatch(/☐/);
    }

    const invite = guideKitForId("basic-invitation-creator");
    const inviteMaterials = invite.steps?.find((s) => /make your marketing materials/i.test(s.title));
    expect(inviteMaterials?.desc).toMatch(/birthday invitation|party invite/i);

    const flyer = guideKitForId("canva-flyer-creator");
    const flyerMaterials = flyer.steps?.find((s) => /make your marketing materials/i.test(s.title));
    expect(flyerMaterials?.desc).toMatch(/Flyer \(US Letter\)|A4 flyer/i);
  });

  it("never resolves Free Wizard / launch guides to generic template steps", () => {
    for (const id of FREE_WIZARD_HUSTLE_IDS) {
      expect(DETAILED_GUIDE_STEPS[id]?.length, `${id} needs DETAILED_GUIDE_STEPS`).toBeGreaterThanOrEqual(5);
      const data = resolveLaunchGuideData(id, []);
      expect(isGenericGuideSteps(data.steps), `${id} still generic`).toBe(false);
      expect(data.steps[0]?.title).not.toMatch(/define the offer|prep your kit|reach out/i);
    }
    // Invitation guide must stay Canva-specific (template pick lives in Make your marketing materials).
    const invite = resolveLaunchGuideData("basic-invitation-creator", []);
    expect(invite.steps.map((s) => s.title).join(" ")).toMatch(/Canva/i);
    expect(invite.steps.some((s) => /canva|Tools tab/i.test(s.desc))).toBe(true);
    expect(guideKitForId("basic-invitation-creator").tools.some((t) => t.id === "canva")).toBe(true);

    for (const g of LAUNCH_GUIDES) {
      const data = resolveLaunchGuideData(g.id, []);
      const kit = guideKitForId(g.id);
      const steps = kit.steps?.length ? kit.steps : data.steps;
      expect(isGenericGuideSteps(steps), `${g.id} resolves generic`).toBe(false);
    }
  });
});

describe("guides review — kids & teens guides", () => {
  it("has unique kids guide ids and non-empty steps", () => {
    const ids = KIDS_GUIDES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of KIDS_GUIDES) {
      expect(g.title.trim().length).toBeGreaterThan(4);
      expect(g.summary.trim().length).toBeGreaterThan(12);
      expect(g.parentTip.trim().length).toBeGreaterThan(8);
      assertNonEmptySteps(g.steps, g.id);
      const min = kidsGuideMinTier(g.id);
      expect(["free", "starter", "pro", "elite"]).toContain(min);
      if (g.free) expect(min).toBe("free");
      const kit = guideKitForId(g.id);
      expect(kit.prerequisites.length).toBeGreaterThan(0);
      expect(kit.tools.length).toBeGreaterThan(0);
      expect(kit.prerequisites.some((p) => p.id === "free-member")).toBe(false);
    }
  });

  it("Kids Corner tiny-game guide (#087) is parent-managed learning, not Antigravity GAME.md", () => {
    const kit = guideKitForId("kids-games-ai");
    const blob = (kit.steps ?? []).map((s) => `${s.title} ${s.desc}`).join("\n");
    expect(blob).toMatch(/parent nearby|parent\/guardian/i);
    expect(blob).not.toMatch(/GAME\.md/);
    expect(blob).not.toMatch(/choose your marketing channels/i);
    expect(kit.tools.some((t) => /scratch|chatgpt|beginner tool stack/i.test(t.name))).toBe(true);
    expect(kidsGuideMinTier("kids-games-ai")).toBe("elite");
  });

  it("Create Games with AI (Kids) still uses ChatGPT / Scratch / Antigravity steps", () => {
    const steps = guideKitForId("create-games-kids").steps ?? CREATE_GAMES_KIDS_STEPS;
    const blob = steps.map((s) => `${s.title} ${s.desc}`).join("\n");
    expect(blob).toMatch(/https:\/\/chatgpt\.com\//);
    expect(blob).toMatch(/https:\/\/gemini\.google\.com\//);
    expect(blob).toMatch(/https:\/\/scratch\.mit\.edu\//);
    expect(blob).toMatch(/https:\/\/antigravity\.google\//);
    expect(blob).toMatch(/GAME\.md/);
  });

  it("AI game guides use realistic ChatGPT / Scratch / Antigravity steps", () => {
    const juniorKit = guideKitForId("junior-games-ai");
    const juniorBlob = (juniorKit.steps ?? []).map((s) => `${s.title} ${s.desc}`).join("\n");
    expect(juniorBlob).toMatch(/one-sentence game idea|core gameplay loop/i);
    expect(juniorBlob).not.toMatch(/choose your marketing channels/i);

    const steps = guideKitForId("create-games-junior").steps ?? CREATE_GAMES_JUNIOR_STEPS;
    const blob = steps.map((s) => `${s.title} ${s.desc}`).join("\n");
    expect(blob).toMatch(/https:\/\/chatgpt\.com\//);
    expect(blob).toMatch(/https:\/\/antigravity\.google\//);
    expect(blob).toMatch(/GAME\.md/);
    expect(kidsGuideMinTier("junior-games-ai")).toBe("elite");
  });

  it("audience helpers return only that audience", () => {
    expect(guidesForAudience("kids").every((g) => g.audience === "kids")).toBe(true);
    expect(guidesForAudience("junior").every((g) => g.audience === "junior")).toBe(true);
  });
});

describe("guides review — senior teasers", () => {
  it("every senior teaser has title, blurb, and a min tier", () => {
    const ids = SENIOR_GUIDE_TEASERS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of SENIOR_GUIDE_TEASERS) {
      expect(g.title.trim().length).toBeGreaterThan(4);
      expect(g.blurb.trim().length).toBeGreaterThan(12);
      const min = seniorGuideMinTier(g.id, g.launchGuideId);
      expect(["free", "starter", "pro", "elite"]).toContain(min);
      if (g.launchGuideId) {
        expect(adultGuideMinTier(g.launchGuideId)).toBe(min);
      }
    }
  });
});

describe("guides review — AI never Free (all Elite)", () => {
  it("catalog AI hustles are Elite", () => {
    for (const h of SIDE_HUSTLES.filter(isAiSideHustle)) {
      expect(h.minTier).toBe("elite");
      expect(h.freeWizardEligible).toBe(false);
      expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(h.id);
    }
    expect(AI_SIDE_HUSTLE_PRO_IDS).toHaveLength(0);
    for (const id of AI_SIDE_HUSTLE_ELITE_IDS) {
      expect(adultGuideMinTier(id)).toBe("elite");
    }
  });

  it("mapped adult AI / game guides stay Starter or Elite", () => {
    for (const [id, tier] of Object.entries(ADULT_GUIDE_MIN_TIER)) {
      if (!id.startsWith("ai-") && !id.includes("game")) continue;
      expect(["starter", "elite"]).toContain(tier);
    }
  });
});

describe("guides review — tool catalog URLs", () => {
  it("every TOOL_CATALOG url is https when present", () => {
    for (const tool of Object.values(TOOL_CATALOG)) {
      if (tool.url) expect(tool.url).toMatch(HTTPS);
    }
  });
});

describe("guides review — Sprint 6 Testing Portal cases", () => {
  it("catalog covers every unique Side Hustle Library guide", () => {
    expect(GUIDE_REVIEW_CATALOG.length).toBe(uniqueGuideLibraryCount());
    expect(GUIDE_REVIEW_CASES.length).toBe(GUIDE_REVIEW_CATALOG.length + 1);
    expect(VT_GUIDES_REVIEW_CASE.id).toBe("VT-GUIDES-REVIEW");
    expect(GUIDE_REVIEW_SPRINT).toBe(6);
  });

  it("places every GUIDE-REV / VT-GUIDES-REVIEW case on Sprint 6", () => {
    for (const c of GUIDE_REVIEW_CASES) {
      expect(isGuideReviewCaseId(c.id)).toBe(true);
      expect(suggestedSprintForTest(c)).toBe(6);
    }
    expect(guideReviewCaseId("launch", "handyman")).toBe("GUIDE-REV-launch-handyman");
  });

  it("assigns manual GUIDE-REV cases to Lyriq with full 7-tab + Active/Reviewed Pass sync steps", () => {
    const manuals = GUIDE_REVIEW_CASES.filter((c) => c.id.startsWith("GUIDE-REV-"));
    expect(manuals.length).toBeGreaterThan(0);
    expect(GUIDE_PREP_REVIEW_TAB_LABELS).toHaveLength(7);
    for (const c of manuals) {
      expect(c.assignees).toEqual(["lyriq"]);
      expect(c.area).toBe("Guides");
      expect(c.relatedTaskIds ?? []).toEqual([]);
      expect(c.title).toMatch(/#\d{3}/);
      expect(c.steps).toHaveLength(7);
      expect(c.steps[1]).toMatch(/all 7 prep tabs/i);
      expect(c.steps[1]).toContain(GUIDE_PREP_REVIEW_TABS_PHRASE);
      expect(c.steps[1]).toMatch(/Show All/);
      expect(c.steps[1]).toMatch(/Prerequisites/);
      expect(c.steps[1]).toMatch(/Suggested Pricing/);
      expect(c.steps[1]).toMatch(/Supply List/);
      expect(c.steps[1]).toMatch(/Tools/);
      expect(c.steps[1]).toMatch(/Steps/);
      expect(c.steps[1]).toMatch(/Revenue Calculator/);
      expect(c.steps[1]).toMatch(/dedicated tab/i);
      expect(c.steps[4]).toMatch(/As QA/i);
      expect(c.steps[4]).toMatch(/Supply List/);
      expect(c.steps[4]).toMatch(/Suggested Pricing/);
      expect(c.steps[4]).toMatch(/Show All/);
      expect(c.steps[4]).toMatch(/dedicated tab/i);
      expect(c.steps[4]).toMatch(/re-order|Save/i);
      expect(c.steps[5]).toMatch(/Active/);
      expect(c.steps[5]).toMatch(/Reviewed/);
      expect(c.steps[5]).not.toMatch(/Confirm both Fixed\/Re-Review and Reviewed stay checked/);
      expect(c.steps[6]).toMatch(/Mark this test Pass/i);
      expect(c.steps[6]).toMatch(/auto-sets Active \+ Reviewed/i);
      expect(c.steps[6]).toMatch(/next GUIDE-REV/i);
      expect(c.expected).toMatch(/Reviewed by QA/i);
      expect(c.expected).toContain(GUIDE_PREP_REVIEW_TABS_PHRASE);
      expect(c.expected).toMatch(/dedicated tabs/i);
    }
  });

  it("VT-GUIDES-REVIEW requires all seven prep tabs in automated coverage", () => {
    expect(VT_GUIDES_REVIEW_CASE.steps.some((s) => s.includes(GUIDE_PREP_REVIEW_TABS_PHRASE))).toBe(
      true,
    );
    expect(VT_GUIDES_REVIEW_CASE.steps.some((s) => /Suggested Pricing/i.test(s))).toBe(true);
    expect(VT_GUIDES_REVIEW_CASE.steps.some((s) => /Supply List/i.test(s))).toBe(true);
    expect(VT_GUIDES_REVIEW_CASE.expected).toMatch(/7 prep tabs/);
  });

  it("every library guide kit resolves all seven prep tab sections", () => {
    const required = [
      "all",
      "prereqs",
      "pricing",
      "supplies",
      "tools",
      "steps",
      "calculator",
    ] as const;
    for (const e of GUIDE_REVIEW_CATALOG) {
      const kit = guideKitForId(e.guideId);
      const tabs = guidePrepSectionIds({
        kit,
        includeSteps: true,
        includeCalculator: true,
      });
      for (const id of required) {
        expect(tabs, `${e.guideId} missing ${id}`).toContain(id);
      }
      expect(kit.suggestedPricing?.items.length, `${e.guideId} pricing`).toBeGreaterThan(0);
      expect(kit.supplies?.items.length, `${e.guideId} supplies`).toBeGreaterThan(0);
    }
  });
});
