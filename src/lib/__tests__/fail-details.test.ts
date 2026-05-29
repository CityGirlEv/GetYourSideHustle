import { describe, it, expect } from "vitest";
import { validateFailDetails, formatFailNote } from "../fail-details";

describe("validateFailDetails", () => {
  const base = { note: "broken", stepIndex: 0, hasEvidence: true, noScreenshot: false };

  it("accepts a complete payload", () => {
    expect(validateFailDetails(base)).toBeNull();
  });

  it("rejects an empty / whitespace note", () => {
    expect(validateFailDetails({ ...base, note: "" })).toMatch(/note/i);
    expect(validateFailDetails({ ...base, note: "   " })).toMatch(/note/i);
  });

  it("rejects a missing step", () => {
    expect(validateFailDetails({ ...base, stepIndex: null })).toMatch(/step/i);
  });

  it("requires evidence OR the no-screenshot acknowledgement", () => {
    expect(
      validateFailDetails({ ...base, hasEvidence: false, noScreenshot: false }),
    ).toMatch(/screenshot/i);
    expect(
      validateFailDetails({ ...base, hasEvidence: false, noScreenshot: true }),
    ).toBeNull();
    expect(
      validateFailDetails({ ...base, hasEvidence: true, noScreenshot: false }),
    ).toBeNull();
  });
});

describe("formatFailNote", () => {
  it("prefixes a structured header onto an empty note", () => {
    const out = formatFailNote("", { note: "modal won't close", stepLabel: "3", noScreenshot: false });
    expect(out).toBe("Step 3 failed: modal won't close");
  });

  it("appends the no-screenshot marker", () => {
    const out = formatFailNote("", { note: "blank page", stepLabel: "1", noScreenshot: true });
    expect(out).toBe("Step 1 failed: blank page (no screenshot available)");
  });

  it("preserves prior note content under the header", () => {
    const out = formatFailNote("regressed in sprint 4", {
      note: "throws 500", stepLabel: "2", noScreenshot: false,
    });
    expect(out.startsWith("Step 2 failed: throws 500")).toBe(true);
    expect(out).toContain("regressed in sprint 4");
  });

  it("does not double-prepend when the same header is already there", () => {
    const first = formatFailNote("", { note: "x", stepLabel: "1", noScreenshot: false });
    const second = formatFailNote(first, { note: "x", stepLabel: "1", noScreenshot: false });
    expect(second).toBe(first);
  });
});