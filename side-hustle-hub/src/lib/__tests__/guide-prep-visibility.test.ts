import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { guidePrepSectionIds } from "../guide-prep-visibility";

describe("guidePrepSectionIds", () => {
  const kit = guideKitForId("handyman");

  it("locked preview is prerequisites only", () => {
    expect(
      guidePrepSectionIds({
        kit,
        prerequisitesOnly: true,
        includeSteps: true,
        includeCalculator: true,
      }),
    ).toEqual(["prereqs"]);
  });

  it("unlocked includes Show All + prereqs + tools (+ optional sections)", () => {
    const ids = guidePrepSectionIds({
      kit,
      includeSteps: true,
      includeCalculator: true,
    });
    expect(ids[0]).toBe("all");
    expect(ids).toContain("prereqs");
    expect(ids).toContain("tools");
    expect(ids).toContain("steps");
    expect(ids).toContain("calculator");
    expect(ids).not.toEqual(["prereqs"]);
  });
});
