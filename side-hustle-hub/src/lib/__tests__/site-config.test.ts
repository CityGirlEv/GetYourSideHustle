import { describe, expect, it } from "vitest";
import { SITE_PURPOSE } from "../site-config";

describe("SITE_PURPOSE", () => {
  it("explains GYSH validates profit before investing time or money", () => {
    expect(SITE_PURPOSE).toMatch(/^What is GYSH\?/);
    expect(SITE_PURPOSE).toContain("Match Wizards");
    expect(SITE_PURPOSE).toContain("estimate profit");
    expect(SITE_PURPOSE).toContain("before you invest your time and/or money");
    expect(SITE_PURPOSE).not.toMatch(/before you spend\.?$/);
  });
});
