/**
 * GYSH production API client — Cloudflare Pages Functions + D1.
 * No localStorage fallback: failures surface clearly to the UI.
 */

import { isRetryableD1ApiError } from "./d1-errors";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const SESSION_KEY = "gysh_session_token";

export function getSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(SESSION_KEY, token);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** Override default abort (e.g. large attachment downloads). */
  timeoutMs?: number;
  /** Internal: already retried a transient D1 timeout. */
  _d1Retried?: boolean;
  /** Internal: already retried a local Vite→:8788 proxy blip. */
  _proxyRetried?: boolean;
};

/** Local Pages Functions + D1 can need >20s on first parallel load after restart. */
const DEFAULT_API_TIMEOUT_MS = 45_000;

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

/**
 * Call /api/*. credentials:include for httpOnly cookie; Bearer from sessionStorage as backup.
 */
export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    accept: "application/json",
  };
  if (opts.body !== undefined) headers["content-type"] = "application/json";

  const auth = opts.auth !== false;
  if (auth) {
    const token = getSessionToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  let res: Response;
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? DEFAULT_API_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    res = await fetch(`/api/${path.replace(/^\//, "")}`, {
      method: opts.method || (opts.body !== undefined ? "POST" : "GET"),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    const onLocalhost =
      typeof window !== "undefined" &&
      /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
    throw new ApiError(
      aborted
        ? "GYSH API timed out. If you're on local Dev, restart `npm run dev` (Pages Functions on :8788 may be stuck)."
        : onLocalhost
          ? "Cannot reach the GYSH API on localhost. Open http://localhost:5173 and run `npm run dev` (not plain Vite) so :8788 is up — first calls to remote D1 can take 10–20s."
          : "Cannot reach the GYSH API. Database/API is unavailable — check deploy bindings and network.",
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const message = await parseError(res);
    // Local Vite proxy → :8788 can blip while wrangler remote D1 is cold-starting.
    if (
      res.status === 502 &&
      !opts._proxyRetried &&
      /Local API worker not running|:8788/i.test(message)
    ) {
      await new Promise((r) => setTimeout(r, 1_500));
      return api<T>(path, { ...opts, _proxyRetried: true });
    }
    // Stale Bearer in sessionStorage can override a still-valid cookie — clear and retry once.
    if (
      auth &&
      res.status === 401 &&
      /session invalid|session expired|not authenticated/i.test(message) &&
      getSessionToken()
    ) {
      setSessionToken(null);
      return api<T>(path, { ...opts, auth: true });
    }
    const method = (opts.method || (opts.body !== undefined ? "POST" : "GET")).toUpperCase();
    if (
      method === "GET" &&
      res.status >= 500 &&
      !opts._d1Retried &&
      isRetryableD1ApiError(message)
    ) {
      return api<T>(path, { ...opts, _d1Retried: true });
    }
    throw new ApiError(message, res.status);
  }

  return (await res.json()) as T;
}

export async function apiHealth(): Promise<{ ok: boolean; db: string; users: number }> {
  return api("health", { auth: false });
}
