import { describe, expect, it } from "vitest";
import {
  ADMIN_GUIDE_META,
  ADMIN_GUIDE_SECTIONS,
  MEMBER_GUIDE_META,
  MEMBER_GUIDE_SECTIONS,
  tocFromSections,
} from "../user-guide-content";

const MOJIBAKE = /â€|Â·|Â\s|â”/;

function walkCopy(value: unknown, visit: (text: string) => void) {
  if (typeof value === "string") {
    visit(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkCopy(item, visit);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) walkCopy(item, visit);
  }
}

describe("user guide copy", () => {
  it("has no mojibake in member or admin guide text", () => {
    walkCopy(
      [MEMBER_GUIDE_META, MEMBER_GUIDE_SECTIONS, ADMIN_GUIDE_META, ADMIN_GUIDE_SECTIONS],
      (text) => {
        expect(text).not.toMatch(MOJIBAKE);
      },
    );
  });

  it("builds a readable table of contents from section titles", () => {
    const labels = [
      ...tocFromSections(MEMBER_GUIDE_SECTIONS),
      ...tocFromSections(ADMIN_GUIDE_SECTIONS),
    ].map((entry) => entry.label);
    expect(labels.length).toBeGreaterThan(10);
    for (const label of labels) {
      expect(label).not.toMatch(MOJIBAKE);
    }
  });
});
