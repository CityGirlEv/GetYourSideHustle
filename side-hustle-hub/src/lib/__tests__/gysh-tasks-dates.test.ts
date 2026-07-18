import { describe, expect, it } from "vitest";
import { isoToMmddyy, mmddyyToIso } from "../gysh-tasks";

describe("task due date calendar helpers", () => {
  it("converts MM/DD/YY to ISO for date inputs", () => {
    expect(mmddyyToIso("07/16/26")).toBe("2026-07-16");
    expect(mmddyyToIso("")).toBe("");
    expect(mmddyyToIso("bad")).toBe("");
  });

  it("converts ISO from date picker to MM/DD/YY", () => {
    expect(isoToMmddyy("2026-07-16")).toBe("07/16/26");
    expect(isoToMmddyy("")).toBe("");
    expect(isoToMmddyy("not-a-date")).toBe(null);
  });

  it("round-trips", () => {
    expect(isoToMmddyy(mmddyyToIso("12/01/26"))).toBe("12/01/26");
  });
});
