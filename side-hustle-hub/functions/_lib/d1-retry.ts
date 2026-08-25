/**
 * Transient D1 failures (local wrangler ↔ remote, or a reset storage object).
 * Retry once after a short pause — do not retry unknown errors.
 */

export function isTransientD1Error(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    /D1_ERROR/i.test(msg) ||
    /storage operation exceeded timeout/i.test(msg) ||
    /object to be reset/i.test(msg) ||
    /Network connection lost/i.test(msg) ||
    /internal error while starting up D1/i.test(msg)
  );
}

export async function withD1Retry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (i === attempts - 1 || !isTransientD1Error(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
    }
  }
  throw last;
}
