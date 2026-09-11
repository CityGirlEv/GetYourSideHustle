/** Client-side match for Cloudflare D1 timeouts that are safe to retry. */
export function isRetryableD1ApiError(message: string): boolean {
  return (
    /D1_ERROR/i.test(message) ||
    /storage operation exceeded timeout/i.test(message) ||
    /object to be reset/i.test(message) ||
    /Network connection lost/i.test(message) ||
    /internal error;\s*reference\s*=/i.test(message) ||
    /database (is )?busy/i.test(message)
  );
}

export const TRANSIENT_DB_USER_MESSAGE =
  "The database is busy. Wait a few seconds and try again.";

export const TRANSIENT_DB_LOGIN_MESSAGE =
  "The database is busy. Wait a few seconds and try signing in again.";

export const LOCAL_DEV_LOGIN_MESSAGE =
  "The local D1 proxy reset. Wait a few seconds and sign in again — npm run dev restarts the API automatically.";

export function isLocalDevHost(hostname: string | undefined): boolean {
  return /^(localhost|127\.0\.0\.1)$/i.test(hostname ?? "");
}

export function loginUnavailableMessage(opts?: { localDev?: boolean }): string {
  return opts?.localDev ? LOCAL_DEV_LOGIN_MESSAGE : TRANSIENT_DB_LOGIN_MESSAGE;
}

export function friendlyD1UserMessage(message: string, opts?: { localDev?: boolean }): string {
  if (isRetryableD1ApiError(message) || /database (is )?busy|database unavailable/i.test(message)) {
    return opts?.localDev ? LOCAL_DEV_LOGIN_MESSAGE : TRANSIENT_DB_USER_MESSAGE;
  }
  return message;
}

/** Idempotent enough to retry when remote D1 returns a transient 5xx. */
export function shouldRetryD1ApiCall(method: string, path: string): boolean {
  const m = method.toUpperCase();
  if (m === "GET" || m === "PUT") return true;
  const p = path.replace(/^\//, "").toLowerCase();
  return p === "auth/login" || p === "health";
}

/** Login and heavy GETs get extra client retries; other safe methods retry once. */
export function d1ClientRetryLimit(method: string, path: string): number {
  if (!shouldRetryD1ApiCall(method, path)) return 0;
  const p = path.replace(/^\//, "").toLowerCase();
  if (p === "auth/login") return 1;
  if (p === "test-statuses" || p === "tasks" || p === "agile-plan") return 3;
  return 1;
}
