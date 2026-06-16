import { describe, it, expect } from "vitest";
import {
  buildAgentRegistrationSteps,
  buildQaRegistrationSteps,
} from "@/lib/registration-test-steps";
import { expandTestWithPlatforms } from "@/lib/platform-variants";
import { TEST_CASES } from "@/lib/test-plan";

describe("buildQaRegistrationSteps", () => {
  it("includes platform-specific device selection", () => {
    const computer = buildQaRegistrationSteps("Computer");
    const phone = buildQaRegistrationSteps("Phone");
    expect(computer.some((s) => /MacBook|Windows laptop/i.test(s))).toBe(true);
    expect(phone.some((s) => /iPhone|Android phone/i.test(s))).toBe(true);
    expect(computer.length).toBe(phone.length);
  });

  it("covers the full NDA registration flow", () => {
    const steps = buildQaRegistrationSteps("Computer");
    expect(steps[0]).toMatch(/incognito/i);
    expect(steps.join(" ")).toMatch(/Continue to NDA/);
    expect(steps.join(" ")).toMatch(/Sign & submit/);
    expect(steps.at(-1)).toMatch(/qa-registration-confirmation/i);
  });
});

describe("buildAgentRegistrationSteps", () => {
  it("skips QA device selection", () => {
    const steps = buildAgentRegistrationSteps("Phone");
    expect(steps.join(" ")).toMatch(/Agent/);
    expect(steps.join(" ")).not.toMatch(/Which devices can you test on/i);
    expect(steps.at(-1)).toMatch(/agent-registration-confirmation/i);
  });
});

describe("registration auth tests fan-out", () => {
  it("aligns Phone and iPad steps with Computer (same count, platform wording)", () => {
    for (const id of ["AUTH-001", "AUTH-005"] as const) {
      const src = TEST_CASES.find((t) => t.id === id);
      expect(src).toBeTruthy();
      const variants = expandTestWithPlatforms(src!);
      expect(variants).toHaveLength(3);
      const [comp, phone, ipad] = variants;
      expect(comp.steps.length).toBe(phone.steps.length);
      expect(comp.steps.length).toBe(ipad.steps.length);
      expect(comp.steps.join(" ")).toMatch(/computer browser/i);
      expect(phone.steps.join(" ")).toMatch(/phone browser/i);
      expect(ipad.steps.join(" ")).toMatch(/ipad browser/i);
    }
  });
});
