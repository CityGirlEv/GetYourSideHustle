import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });
  it("drops falsy values", () => {
    expect(cn("p-2", false, null, undefined, "")).toBe("p-2");
  });
  it("lets later tailwind classes override earlier ones", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
