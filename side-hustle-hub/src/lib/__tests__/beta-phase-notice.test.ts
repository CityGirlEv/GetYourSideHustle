import { describe, expect, it } from "vitest";
import {
  BETA_PHASE_NOTICE,
  BETA_PHASE_NOTICE_ENABLED,
  BETA_TESTER_SIGNUP_NOTICE,
  betaNoticePreviewRequested,
  shouldOpenBetaNoticeAfterLogin,
} from "../beta-phase-notice";

describe("beta phase notice", () => {
  it("stays off after login while GYSH is live", () => {
    expect(BETA_PHASE_NOTICE_ENABLED).toBe(false);
    expect(shouldOpenBetaNoticeAfterLogin("admin")).toBe(false);
    expect(shouldOpenBetaNoticeAfterLogin("member")).toBe(false);
    expect(shouldOpenBetaNoticeAfterLogin("invalid")).toBe(false);
    expect(shouldOpenBetaNoticeAfterLogin("unavailable")).toBe(false);
  });

  it("does not open from the QA preview query while disabled", () => {
    expect(betaNoticePreviewRequested("?betaNotice=1")).toBe(false);
    expect(betaNoticePreviewRequested("betaNotice=1")).toBe(false);
    expect(betaNoticePreviewRequested("?betaNotice=0")).toBe(false);
    expect(betaNoticePreviewRequested("")).toBe(false);
  });

  it("keeps retired beta copy on file", () => {
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
