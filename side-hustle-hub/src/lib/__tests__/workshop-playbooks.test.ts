import { describe, expect, it } from "vitest";
import {
  AI_SCENE_PACKS_WORKSHOP_ID,
  workshopMemberAccessLabel,
  workshopPlaybook,
  workshopPublicTags,
  workshopRequiresMember,
  workshopSneakPeek,
} from "../workshop-playbooks";

describe("workshop playbooks", () => {
  it("loads the 90-Minute AI Marketing Video Hands-On Workshop playbook from the title page, TOC, Before Class, and 90-minute clock", () => {
    const book = workshopPlaybook(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(book).toBeTruthy();
    expect(book!.subtitle).toMatch(/MAKE IT POP/i);
    expect(book!.subtitle).toMatch(/ChatGPT \+ Hedra \+ CapCut/);
    expect(book!.description).toMatch(/3-scene marketing video/i);
    expect(book!.learnItems).toHaveLength(5);
    expect(book!.agenda[0]).toMatch(/Before Class/i);
    expect(book!.agenda).toContain("CapCut — Make It Pop");
    expect(book!.agenda).toHaveLength(16);
    expect(book!.agenda.at(-1)).toMatch(/Credits & Plans/i);
    expect(book!.beforeClass.some((line) => /Hedra/i.test(line))).toBe(true);
    expect(book!.beforeClass).toHaveLength(5);
    expect(book!.productionClock.at(-1)).toEqual({ section: "Total", minutes: "90 minutes" });
    expect(book!.productionClock).toHaveLength(10);
    expect(book!.minTier).toBe("free");
    expect(workshopRequiresMember(AI_SCENE_PACKS_WORKSHOP_ID)).toBe(true);
    expect(workshopMemberAccessLabel(AI_SCENE_PACKS_WORKSHOP_ID)).toMatch(/Free membership/i);
    expect(workshopPlaybook("glow-getter-launch")).toBeNull();
    expect(workshopRequiresMember("glow-getter-launch")).toBe(false);
  });

  it("replaces the Content bubble with a Prerequisites preview of the MAKE IT POP guide", () => {
    const peek = workshopSneakPeek(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(peek).toBeTruthy();
    expect(peek!.kicker).toBe("MAKE IT POP");
    expect(peek!.title).toBe("90-Minute AI Marketing Video Hands-On Workshop Guide");
    expect(peek!.tools).toBe("ChatGPT + Hedra + CapCut");
    expect(peek!.coverLead).toMatch(/teaches you how to/i);
    expect(peek!.coverItems).toEqual(
      workshopPlaybook(AI_SCENE_PACKS_WORKSHOP_ID)!.learnItems,
    );
    expect(peek!.coverItems).toHaveLength(5);
    expect(peek!.copyrightHeading).toMatch(/copyright/i);
    expect(peek!.copyrightLines[0]).toMatch(/Get Your Side Hustle/i);
    expect(peek!.toc).toHaveLength(16);
    expect(peek!.toc[0]).toMatch(/Before Class/i);
    expect(peek!.toc[14]).toMatch(/Scene Production Pack/i);
    expect(peek!.toc[15]).toMatch(/Credits & Plans/i);
    expect(peek!.creditsHeading).toMatch(/Credits & Plans/i);
    expect(peek!.creditPlans.map((p) => p.tool)).toEqual(["ChatGPT", "Hedra", "CapCut"]);
    expect(peek!.creditsTip).toMatch(/GYSH TIP/i);
    expect(peek!.rulesHeading).toMatch(/WORKSHOP RULES/i);
    expect(peek!.rules).toHaveLength(6);
    expect(peek!.rules[0]).toEqual({
      code: "0.1",
      text: "Arrive ready. Accounts, software, idea and assets are prepared before class.",
    });
    expect(peek!.beforeClassHeading).toMatch(/BEFORE CLASS/i);
    expect(peek!.beforeClass).toHaveLength(5);
    expect(peek!.beforeClass[1]?.code).toBe("1.2");
    expect(workshopPublicTags(AI_SCENE_PACKS_WORKSHOP_ID, ["AI Video", "Content"])).toEqual(["AI Video"]);
    expect(workshopSneakPeek("glow-getter-launch")).toBeNull();
    expect(workshopPublicTags("glow-getter-launch", ["Kids", "Content"])).toEqual(["Kids", "Content"]);
  });
});
