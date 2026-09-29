import { describe, expect, it } from "vitest";
import { guidePrepAfterTabsOwnsPanel } from "../../components/GuidePrepSections";

describe("guidePrepAfterTabsOwnsPanel", () => {
  it("lets members use normal Prerequisites / Tools / Steps panels", () => {
    expect(guidePrepAfterTabsOwnsPanel(false)).toBeUndefined();
  });

  it("only owns the Notes dedicated tab for staff (Show All still lists every section)", () => {
    expect(guidePrepAfterTabsOwnsPanel(true)).toEqual(["notes"]);
  });

  it("keeps Prerequisites, Tools, Steps, Pricing, and Supply List on normal panels for staff", () => {
    const owned = guidePrepAfterTabsOwnsPanel(true) ?? [];
    expect(owned).not.toContain("prereqs");
    expect(owned).not.toContain("tools");
    expect(owned).not.toContain("steps");
    expect(owned).not.toContain("pricing");
    expect(owned).not.toContain("supplies");
    expect(owned).not.toContain("all");
  });
});
