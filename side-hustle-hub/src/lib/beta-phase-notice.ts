/** Site-wide beta notice shown after a successful sign-in. */

export type BetaPhaseNoticeCopy = {
  title: string;
  body: string;
  confirmLabel: string;
};

/**
 * GYSH is live. Keep the “We're in Beta” login popup off.
 * Flip to true only if we need the notice again.
 */
export const BETA_PHASE_NOTICE_ENABLED = false;

export const BETA_PHASE_NOTICE: BetaPhaseNoticeCopy = {
  title: "We're in Beta",
  body:
    "Get Your Side Hustle is in beta and undergoing testing. You may see changes, the occasional bug, or features that are still being polished. Thanks for being here — your patience and feedback help us get it right.",
  confirmLabel: "Got it",
};

/**
 * Shown right after someone applies as a Beta Tester on membership signup.
 * Emphasize pending activation — they cannot sign in until an admin clears them.
 */
export const BETA_TESTER_SIGNUP_NOTICE: BetaPhaseNoticeCopy = {
  title: "Thanks for applying as a Beta Tester",
  body:
    "Please stand by for account activation. An admin still needs to approve your login before you can sign in. Check your email for a confirmation now; you'll get a welcome message with next steps once you're activated. After that, sign in and open the Beta Tester dashboard to start testing under your NDA.",
  confirmLabel: "Got it",
};

/** QA / e2e preview: /?betaNotice=1 opens the same popup without signing in. */
export const BETA_NOTICE_PREVIEW_PARAM = "betaNotice";

export function shouldOpenBetaNoticeAfterLogin(outcome: string): boolean {
  if (!BETA_PHASE_NOTICE_ENABLED) return false;
  return outcome === "admin" || outcome === "member";
}

export function betaNoticePreviewRequested(search: string): boolean {
  if (!BETA_PHASE_NOTICE_ENABLED) return false;
  try {
    return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get(
      BETA_NOTICE_PREVIEW_PARAM,
    ) === "1";
  } catch {
    return false;
  }
}
