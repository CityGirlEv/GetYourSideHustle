import { describe, expect, it } from "vitest";
import { PUBLIC_PAGE_LINK_TESTS } from "@/lib/public-page-link-tests";

describe("public-page-link-tests", () => {
  it("assigns all link tests to Lyriq", () => {
    expect(PUBLIC_PAGE_LINK_TESTS.length).toBeGreaterThanOrEqual(15);
    for (const t of PUBLIC_PAGE_LINK_TESTS) {
      expect(t.assignee).toBe("Lyriq");
      expect(t.path).toBeTruthy();
    }
  });

  it("includes About → Learning Center regression", () => {
    expect(PUBLIC_PAGE_LINK_TESTS.some((t) => t.id === "LINK-003")).toBe(true);
  });
});
