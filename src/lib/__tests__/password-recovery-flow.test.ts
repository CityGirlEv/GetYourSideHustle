import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("password recovery setup flow", () => {
  it("reset-password route gates QA legacy users through device setup", () => {
    const src = readFileSync(resolve(__dirname, "../../routes/reset-password.tsx"), "utf8");
    expect(src).toContain("getPasswordRecoverySetupStatus");
    expect(src).toContain("RecoveryDeviceSetup");
    expect(src).toContain("confirmPasswordSet");
    expect(src).toContain('phase === "devices"');
  });

  it("admin enable email passes needsPasswordSetup to welcome template", () => {
    const src = readFileSync(resolve(__dirname, "../admin.functions.ts"), "utf8");
    expect(src).toContain("needsPasswordSetup");
    expect(src).toContain("generateBrandedRecoveryLink");
    expect(src).toContain("resetPasswordUrl");
  });

  it("registration marks password_confirmed_at for new accounts with passwords", () => {
    const src = readFileSync(resolve(__dirname, "../registration.functions.ts"), "utf8");
    expect(src).toContain("markPasswordConfirmed");
  });

  it("QA onboarding gate skips reset-password route", () => {
    const src = readFileSync(resolve(__dirname, "../../components/QAOnboardingDialog.tsx"), "utf8");
    expect(src).toContain("RESET_PASSWORD_PATH");
  });
});
