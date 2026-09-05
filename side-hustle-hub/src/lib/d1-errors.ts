/** Client-side match for Cloudflare D1 timeouts that are safe to retry. */
export function isRetryableD1ApiError(message: string): boolean {
  return (
    /D1_ERROR/i.test(message) ||
    /storage operation exceeded timeout/i.test(message) ||
    /object to be reset/i.test(message) ||
    /Network connection lost/i.test(message) ||
    /internal error;\s*reference\s*=/i.test(message)
  );
}

/** Idempotent enough to retry once when remote D1 returns a transient 5xx. */
export function shouldRetryD1ApiCall(method: string, path: string): boolean {
  const m = method.toUpperCase();
  if (m === "GET" || m === "PUT") return true;
  const p = path.replace(/^\//, "").toLowerCase();
  return p === "auth/login" || p === "health";
}
