import { describe, expect, it } from "vitest";
import { GUIDE_SUPPLIES } from "../guide-supplies";

describe("GUIDE_SUPPLIES cleaning-service", () => {
  it("lists vacuum and mop as core kit items", () => {
    const list = GUIDE_SUPPLIES["cleaning-service"];
    expect(list).toBeDefined();
    const vacuum = list!.items.find((i) => i.id === "vacuum");
    const mop = list!.items.find((i) => i.id === "mop");
    expect(vacuum?.optional).toBeFalsy();
    expect(mop?.optional).toBeFalsy();
    expect(vacuum?.notes).toMatch(/core/i);
    expect(mop?.notes).toMatch(/core/i);
  });
});
