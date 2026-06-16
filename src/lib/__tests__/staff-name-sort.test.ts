import { describe, it, expect } from "vitest";
import {
  compareStaffByDisplayName,
  compareStaffByFullName,
  parseStaffNameParts,
  sortStaffByName,
} from "@/lib/staff-name-sort";

describe("parseStaffNameParts", () => {
  it("uses last token as last name for multi-part names", () => {
    expect(parseStaffNameParts("Jane Marie Smith")).toEqual({
      firstName: "Jane",
      lastName: "Smith",
    });
  });

  it("treats single-name users as both first and last", () => {
    expect(parseStaffNameParts("Madonna")).toEqual({
      firstName: "Madonna",
      lastName: "Madonna",
    });
  });

  it("returns empty parts for blank input", () => {
    expect(parseStaffNameParts("   ")).toEqual({ firstName: "", lastName: "" });
  });
});

describe("compareStaffByDisplayName", () => {
  it("sorts by first name case-insensitively", () => {
    expect(compareStaffByDisplayName("Bob Adams", "Alice Baker")).toBeGreaterThan(0);
    expect(compareStaffByDisplayName("alice smith", "Bob Adams")).toBeLessThan(0);
  });

  it("uses last name as tiebreaker when first names match", () => {
    expect(compareStaffByDisplayName("Alice Smith", "Alice Adams")).toBeGreaterThan(0);
  });

  it("sorts a roster first-name first", () => {
    const names = ["Taylor Jones", "Jamie Lee", "Alex Smith"];
    const sorted = sortStaffByName(names, (n) => n);
    expect(sorted).toEqual(["Alex Smith", "Jamie Lee", "Taylor Jones"]);
  });
});

describe("compareStaffByFullName", () => {
  it("falls back to email when full_name is empty", () => {
    expect(
      compareStaffByFullName(
        { full_name: "", email: "zara@example.com" },
        { full_name: "", email: "amy@example.com" },
      ),
    ).toBeGreaterThan(0);
  });
});
