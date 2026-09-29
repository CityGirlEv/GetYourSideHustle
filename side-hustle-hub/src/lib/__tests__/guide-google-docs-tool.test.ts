import { describe, expect, it } from "vitest";
import { clientScoutSteps, OPEN_GOOGLE_DOCS_FROM_TOOLS } from "../guide-detailed-steps";
import {
  ensureGoogleDocsTool,
  guideKitForId,
  TOOL_CATALOG,
  formatGuideToolLine,
} from "../guide-tools";

describe("Google Docs as a Tool", () => {
  it("lists Google Docs with Google sign-in (or existing account) wording", () => {
    const tool = TOOL_CATALOG.google_docs;
    expect(tool.name).toBe("Google Docs");
    expect(tool.url).toMatch(/accounts\.google\.com/);
    expect(tool.url).toMatch(/docs\.google\.com/);
    expect(tool.costNote.toLowerCase()).toMatch(/sign in/);
    expect(tool.costNote.toLowerCase()).toMatch(/already have/);
    expect(formatGuideToolLine(tool)).toMatch(/accounts\.google\.com/);
  });

  it("marketing plan steps point to the Tools tab instead of a raw Docs URL", () => {
    const steps = clientScoutSteps({
      serviceLabel: "Dog Walking",
      examplePitch: "I walk dogs.",
      examplePrice: "About $15.",
    });
    const plan = steps.find((s) => /pick how you will tell people/i.test(s.title));
    expect(plan?.desc).toContain(OPEN_GOOGLE_DOCS_FROM_TOOLS);
    expect(plan?.desc).not.toMatch(/https:\/\/docs\.google\.com/);
  });

  it("auto-adds Google Docs to Tools when a guide’s steps mention it", () => {
    const kit = guideKitForId("neighborhood-helper");
    expect(kit.tools.some((t) => t.id === "google_docs")).toBe(true);
    expect(kit.steps?.some((s) => /google docs/i.test(`${s.title} ${s.desc}`))).toBe(true);
  });

  it("ensureGoogleDocsTool is idempotent and refreshes catalog copy", () => {
    const once = ensureGoogleDocsTool([], [{ title: "Plan", desc: "Use Google Docs today." }]);
    expect(once).toHaveLength(1);
    const twice = ensureGoogleDocsTool(once, [{ title: "Plan", desc: "Use Google Docs today." }]);
    expect(twice).toHaveLength(1);
    expect(twice[0]?.url).toBe(TOOL_CATALOG.google_docs.url);
  });
});
