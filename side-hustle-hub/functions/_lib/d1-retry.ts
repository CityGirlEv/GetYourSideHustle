/**
 * Transient D1 failures (local wrangler ↔ remote, or a reset storage object).
 * Retry once after a short pause — do not retry unknown errors or free-tier quota.
 */

export const TRANSIENT_DB_USER_MESSAGE =
  "The database is busy. Wait a few seconds and try again.";

/** Free plan hit daily row read/write cap — retries cannot help until upgrade or midnight UTC. */
export const D1_QUOTA_USER_MESSAGE =
  "GYSH hit Cloudflare D1’s free-tier daily limit. Upgrade Workers to Paid ($5/mo) in the Cloudflare dashboard to restore login now, or wait until midnight UTC.";

/** One extra attempt for sign-in — more retries stall a dead Wrangler D1 proxy (~2s each). */
export const LOGIN_D1_ATTEMPTS = 2;

export function isD1QuotaExceededError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    /exceeded D1'?s? free tier daily row (read|write) limit/i.test(msg) ||
    /free tier daily row (read|write) limit/i.test(msg) ||
    /\[code:\s*7500\]/i.test(msg) ||
    /code:\s*7500\b/i.test(msg)
  );
}

export function isTransientD1Error(error: unknown): boolean {
  if (isD1QuotaExceededError(error)) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    /D1_ERROR/i.test(msg) ||
    /storage operation exceeded timeout/i.test(msg) ||
    /object to be reset/i.test(msg) ||
    /Network connection lost/i.test(msg) ||
    /internal error while starting up D1/i.test(msg) ||
    /internal error;\s*reference\s*=/i.test(msg)
  );
}

/** Map thrown D1 failures to a status + message safe to show on the login form. */
export function publicCaughtApiError(error: unknown): { message: string; status: number } {
  if (isD1QuotaExceededError(error)) {
    return { message: D1_QUOTA_USER_MESSAGE, status: 503 };
  }
  if (isTransientD1Error(error)) {
    return { message: TRANSIENT_DB_USER_MESSAGE, status: 503 };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { message: `Server error: ${message}`, status: 500 };
}

export async function withD1Retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (isD1QuotaExceededError(error)) throw error;
      if (i === attempts - 1 || !isTransientD1Error(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
    }
  }
  throw last;
}
