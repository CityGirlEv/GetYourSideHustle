import { describe, it, expect } from "vitest";
import { VOICE_INPUT_ENABLED, VOICE_WIZARD_ENABLED } from "../feature-flags";

describe("feature flags", () => {
  it("voice flags are enabled", () => {
    expect(VOICE_INPUT_ENABLED).toBe(true);
    expect(VOICE_WIZARD_ENABLED).toBe(true);
  });
});
