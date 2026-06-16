import { describe, it, expect } from "vitest";
import { VOICE_WIZARD_ENABLED } from "../feature-flags";

describe("feature flags", () => {
  it("voice wizard flag is a boolean", () => {
    expect(typeof VOICE_WIZARD_ENABLED).toBe("boolean");
  });
});
