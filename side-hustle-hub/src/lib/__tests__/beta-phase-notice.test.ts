import { describe, expect, it } from "vitest";
import {
  BETA_PHASE_NOTICE,
  BETA_TESTER_SIGNUP_NOTICE,
  betaNoticePreviewRequested,
  shouldOpenBetaNoticeAfterLogin,
} from "../beta-phase-notice";

describe("beta phase notice", () => {
  it("opens after admin or member login, not failed attempts", () => {
    expect(shouldOpenBetaNoticeAfterLogin("admin")).toBe(true);
    expect(shouldOpenBetaNoticeAfterLogin("member")).toBe(true);
    expect(shouldOpenBetaNoticeAfterLogin("invalid")).toBe(false);
    expect(shouldOpenBetaNoticeAfterLogin("unavailable")).toBe(false);
  });

  it("opens from the QA preview query only when betaNotice=1", () => {
    expect(betaNoticePreviewRequested("?betaNotice=1")).toBe(true);
    expect(betaNoticePreviewRequested("betaNotice=1")).toBe(true);
    expect(betaNoticePreviewRequested("?betaNotice=0")).toBe(false);
    expect(betaNoticePreviewRequested("")).toBe(false);
  });

  it("tells visitors the site is in beta and being tested", () => {
    expect(BETA_PHASE_NOTICE.title).toMatch(/beta/i);
    expect(BETA_PHASE_NOTICE.body).toMatch(/undergoing testing/i);
    expect(BETA_PHASE_NOTICE.confirmLabel).toBeTruthy();
  });

  it("tells new Beta Testers to stand by for activation and next steps", () => {
    expect(BETA_TESTER_SIGNUP_NOTICE.title).toMatch(/beta tester/i);
    expect(BETA_TESTER_SIGNUP_NOTICE.body).toMatch(/stand by/i);
    expect(BETA_TESTER_SIGNUP_NOTICE.body).toMatch(/activation/i);
    expect(BETA_TESTER_SIGNUP_NOTICE.body).toMatch(/next steps/i);
    expect(BETA_TESTER_SIGNUP_NOTICE.body).toMatch(/email/i);
    expect(BETA_TESTER_SIGNUP_NOTICE.confirmLabel).toBeTruthy();
  });
});
