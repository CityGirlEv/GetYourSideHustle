import { describe, expect, it } from "vitest";
import {
  guideStepChecklistItemKey,
  parseGuideStepDesc,
  stepDescHasChecklist,
} from "../guide-step-checklist";

describe("guide-step-checklist", () => {
  const sample = [
    "Write your goals, then check each channel you will use:",
    "☐ Phone calls",
    "☐ Text messages",
    "☐ Printed flyer",
    "Then start outreach this week.",
  ].join("\n");

  it("detects checklist lines", () => {
    expect(stepDescHasChecklist(sample)).toBe(true);
    expect(stepDescHasChecklist("No boxes here")).toBe(false);
  });

  it("parses text and checklist segments with stable indexes", () => {
    const segs = parseGuideStepDesc(sample);
    expect(segs.filter((s) => s.kind === "check")).toHaveLength(3);
    expect(segs.filter((s) => s.kind === "check").map((s) => (s.kind === "check" ? s.index : -1))).toEqual([
      0, 1, 2,
    ]);
    expect(segs.find((s) => s.kind === "check" && s.index === 1)).toMatchObject({
      label: "Text messages",
      checkedMarker: false,
    });
  });

  it("builds persistence keys that do not collide with step-done keys", () => {
    expect(guideStepChecklistItemKey("mothers-helper", 3, 0)).toBe("mothers-helper-3-i0");
    expect(guideStepChecklistItemKey("mothers-helper", 3, 0)).not.toBe("mothers-helper-3");
  });

  it("treats ✓ / ☑ as pre-checked markers (authored steps should use ☐ only)", () => {
    const checked = parseGuideStepDesc("✓ Already done\n☑ Also done\n☐ Not yet");
    const checks = checked.filter((s) => s.kind === "check");
    expect(checks).toHaveLength(3);
    expect(checks[0]).toMatchObject({ checkedMarker: true, label: "Already done" });
    expect(checks[1]).toMatchObject({ checkedMarker: true, label: "Also done" });
    expect(checks[2]).toMatchObject({ checkedMarker: false, label: "Not yet" });
  });

  it("authored detailed-step checklists ship unchecked (☐ only)", async () => {
    const modules = [
      "../appointment-setter-guide",
      "../property-mgmt-guide",
      "../local-event-content-creator-guide",
      "../youth-sports-helper-guide",
      "../kids-kindness-share-guide",
      "../beach-shell-jewelry-guide",
      "../gift-wrapping-guide",
      "../affiliate-guide",
      "../dropshipping-guide",
      "../fb-marketplace-helper-guide",
      "../basic-invitation-creator-guide",
      "../pod-guide",
      "../pet-sitting-guide",
      "../friendship-bracelet-maker-guide",
      "../leaf-raking-guide",
      "../lemonade-stand-guide",
      "../airbnb-hosting-guide",
      "../digital-cookbook-creator-guide",
      "../family-photo-slideshow-guide",
      "../local-resource-list-creator-guide",
      "../recycling-helper-guide",
      "../proofreader-guide",
      "../toy-organizer-guide",
      "../trash-can-service-guide",
      "../homework-helper-guide",
      "../canva-flyer-creator-guide",
      "../car-interior-cleanup-guide",
      "../neighborhood-dog-walker-guide",
      "../junior-give-back-teach-guide",
      "../lead-followup-assistant-guide",
      "../personal-shopper-guide",
      "../kids-piggy-first-goal-guide",
      "../kids-reinvest-jar-guide",
      "../junior-reinvest-ceo-guide",
      "../online-research-assistant-guide",
      "../mothers-helper-guide",
      "../babysitting-guide",
      "../errand-runner-guide",
      "../ai-agents-guide",
      "../ai-promo-video-guide",
      "../ai-timing-guide",
      "../homework-organizer-guide",
      "../yard-help-guide",
      "../group-setup-helper-guide",
      "../house-sitter-guide",
      "../bookkeeping-guide",
      "../closet-cleanout-listing-guide",
      "../nonprofit-social-helper-guide",
      "../digital-products-guide",
      "../book-publishing-guide",
      "../start-gardening-club-guide",
      "../start-book-club-guide",
      "../foreclosure-properties-guide",
      "../cleaning-service-guide",
      "../kids-games-ai-guide",
      "../airbnb-turnover-checker-guide",
      "../str-cohost-guide",
      "../junior-games-ai-guide",
      "../tech-helper-guide",
    ] as const;
    for (const mod of modules) {
      const exported = (await import(mod)) as Record<string, unknown>;
      const steps = Object.entries(exported).find(([k]) => /DETAILED_STEPS$/i.test(k))?.[1] as
        | { title: string; desc: string }[]
        | undefined;
      if (!steps?.length) continue;
      for (const step of steps) {
        const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
        for (const c of checks) {
          expect(c.checkedMarker, `${mod} · ${step.title} · ${c.label}`).toBe(false);
        }
      }
    }
  });
});

