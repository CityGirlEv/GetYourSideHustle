import { describe, expect, it } from "vitest";
import { AI_SCENE_PACKS_WORKSHOP_ID } from "../workshop-playbooks";
import {
  WORKSHOP_FREE_MEMBERSHIP_NEED,
  workshopMemberGateDirections,
  workshopMemberGateWorkshopName,
} from "../workshop-member-gate";

describe("workshop member gate copy", () => {
  it("requires Free membership or higher in bold lead copy", () => {
    expect(WORKSHOP_FREE_MEMBERSHIP_NEED).toBe("Need Free membership or higher to attend.");
  });

  it("sends people back through Community → Workshops for the 90-Minute AI Workshop", () => {
    expect(workshopMemberGateWorkshopName(AI_SCENE_PACKS_WORKSHOP_ID, "ignored")).toBe(
      "the 90-Minute AI Workshop",
    );
    const directions = workshopMemberGateDirections(
      "ai-marketing-video",
      "90-Minute AI Marketing Video Hands-On Workshop",
    );
    expect(directions).toMatch(/Create a FREE account/i);
    expect(directions).toContain("Community → Workshops");
    expect(directions).toContain("the 90-Minute AI Workshop");
    expect(directions).toMatch(/click Register again/i);
  });
});
