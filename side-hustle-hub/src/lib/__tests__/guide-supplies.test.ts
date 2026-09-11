import { describe, expect, it } from "vitest";
import { GUIDE_SUPPLIES } from "../guide-supplies";

describe("GUIDE_SUPPLIES cleaning-service", () => {
  it("lists vacuum and mop as optional when the client doesn’t provide them", () => {
    const list = GUIDE_SUPPLIES["cleaning-service"];
    expect(list).toBeDefined();
    const vacuum = list!.items.find((i) => i.id === "vacuum");
    const mop = list!.items.find((i) => i.id === "mop");
    expect(vacuum?.optional).toBe(true);
    expect(mop?.optional).toBe(true);
    expect(vacuum?.name.toLowerCase()).toContain("if client");
    expect(mop?.name.toLowerCase()).toContain("if client");
  });
});
