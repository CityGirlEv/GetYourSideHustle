import { describe, expect, it } from "vitest";
import { ROOT_FONT_SIZE_PX } from "@/lib/typography";

describe("typography tokens", () => {
  it("uses a 16px root baseline for mobile-readable body text", () => {
    expect(ROOT_FONT_SIZE_PX).toBe(16);
  });
});
