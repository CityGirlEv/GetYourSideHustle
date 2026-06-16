import { describe, it, expect } from "vitest";
import { nextCustomTestId } from "@/lib/custom-tests";

describe("nextCustomTestId", () => {
  it("increments from base custom test ids", () => {
    expect(nextCustomTestId(["CUS-001", "CUS-002"])).toBe("CUS-003");
  });

  it("counts platform variants toward the same CUS sequence", () => {
    expect(nextCustomTestId(["CUS-001-COMP", "CUS-001-PHONE", "CUS-001-IPAD"])).toBe("CUS-002");
  });

  it("uses the highest number from mixed built-in and custom ids", () => {
    expect(nextCustomTestId(["AUTH-001-PHONE", "CUS-005-IPAD", "SCEN-002"])).toBe("CUS-006");
  });

  it("starts at CUS-001 when no custom ids exist", () => {
    expect(nextCustomTestId(["AUTH-001", "SCEN-002-PHONE"])).toBe("CUS-001");
  });
});
