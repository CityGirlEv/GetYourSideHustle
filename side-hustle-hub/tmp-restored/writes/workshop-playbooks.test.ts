import { describe, expect, it } from "vitest";
import {
  AI_SCENE_PACKS_WORKSHOP_ID,
  workshopMemberAccessLabel,
  workshopPlaybook,
  workshopRequiresMember,
} from "../workshop-playbooks";

describe("workshop playbooks", () => {
  it("loads Creating AI Videos using Scene Production Packs from the title page, TOC, Before Class, and 90-minute clock", () => {
    const book = workshopPlaybook(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(book).toBeTruthy();
    expect(book!.subtitle).toMatch(/MAKE IT POP/i);
    expect(book!.subtitle).toMatch(/ChatGPT \+ Hedra \+ CapCut/);
    expect(book!.description).toMatch(/3-scene marketing video/i);
    expect(book!.learnItems).toHaveLength(5);
    expect(book!.agenda[0]).toMatch(/Before Class/i);
    expect(book!.agenda).toContain("CapCut — Make It Pop");
    expect(book!.agenda).toHaveLength(15);
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
});
