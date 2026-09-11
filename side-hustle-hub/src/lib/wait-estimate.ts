/** Soft estimates for indeterminate network waits. Progress caps until the request finishes. */

export const WAIT_PROGRESS_CAP = 95;
export const DEFAULT_WAIT_ESTIMATE_MS = 20_000;
/** Account create — server returns after D1 insert; email finishes in the background. */
export const SIGNUP_WAIT_MS = 8_000;
/** Billing / Access hits Stripe purchase sync — often ~1 minute. */
export const BILLING_ACCESS_WAIT_MS = 60_000;
/** Credits tab grants pending packs from the same Stripe sync — often ~1 minute. */
export const CREDITS_TAB_WAIT_MS = BILLING_ACCESS_WAIT_MS;
/** Cart / checkout balance fetch — GET member-credits, not the Stripe sync. */
export const CART_CREDITS_WAIT_MS = 12_000;

export function formatApproxRemaining(remainingMs: number): string {
  const secs = Math.max(1, Math.ceil(Math.max(0, remainingMs) / 1000));
  if (secs >= 60) {
    const mins = Math.ceil(secs / 60);
    return `~${mins} min remaining`;
  }
  return `~${secs}s remaining`;
}

export function waitProgress(
  elapsedMs: number,
  estimateMs: number,
  cap = WAIT_PROGRESS_CAP,
): {
  progressPct: number;
  remainingPct: number;
  remainingMs: number;
  atCap: boolean;
  remainingLabel: string;
} {
  const estimate = Math.max(1, Math.floor(Number(estimateMs) || 0));
  const elapsed = Math.max(0, Number(elapsedMs) || 0);
  const progressPct = Math.min(cap, Math.max(0, (elapsed / estimate) * 100));
  const remainingPct = Math.max(100 - cap, Math.round(100 - progressPct));
  const remainingMs = Math.max(0, estimate - elapsed);
  const atCap = progressPct >= cap;
  return {
    progressPct,
    remainingPct,
    remainingMs,
    atCap,
    remainingLabel: atCap
      ? "Almost there…"
      : `${remainingPct}% time remaining · ${formatApproxRemaining(remainingMs)}`,
  };
}
