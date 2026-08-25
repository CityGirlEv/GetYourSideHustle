/** Site-wide beta notice shown after a successful sign-in. */

export const BETA_PHASE_NOTICE = {
  title: "We're in Beta",
  body:
    "Get Your Side Hustle is in beta and undergoing testing. You may see changes, the occasional bug, or features that are still being polished. Thanks for being here — your patience and feedback help us get it right.",
  confirmLabel: "Got it",
} as const;

/** QA / e2e preview: /?betaNotice=1 opens the same popup without signing in. */
export const BETA_NOTICE_PREVIEW_PARAM = "betaNotice";

export function shouldOpenBetaNoticeAfterLogin(outcome: string): boolean {
  return outcome === "admin" || outcome === "member";
}

export function betaNoticePreviewRequested(search: string): boolean {
  try {
    return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get(
      BETA_NOTICE_PREVIEW_PARAM,
    ) === "1";
  } catch {
    return false;
  }
}
