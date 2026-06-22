import { describe, it, expect } from "vitest";
import {
  VOICE_INPUT_ENABLED,
  VOICE_WIZARD_ENABLED,
  VOICE_WIZARD_ADMIN_ONLY,
  isVoiceWizardAvailable,
} from "../feature-flags";

describe("feature flags", () => {
  it("voice flags are enabled", () => {
    expect(VOICE_INPUT_ENABLED).toBe(true);
    expect(VOICE_WIZARD_ENABLED).toBe(true);
    expect(VOICE_WIZARD_ADMIN_ONLY).toBe(true);
  });

  it("isVoiceWizardAvailable is limited to logged-in admin or QA while testing", () => {
    expect(isVoiceWizardAvailable({ role: "admin" })).toBe(true);
    expect(isVoiceWizardAvailable({ role: "qa" })).toBe(true);
    expect(isVoiceWizardAvailable({ role: "viewer", roles: ["qa"] })).toBe(true);
    expect(isVoiceWizardAvailable({ role: "viewer" })).toBe(false);
    expect(isVoiceWizardAvailable(null)).toBe(false);
    expect(isVoiceWizardAvailable(undefined)).toBe(false);
  });
});
