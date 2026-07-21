/**
 * GYSH production API client — Cloudflare Pages Functions + D1.
 * No localStorage fallback: failures surface clearly to the UI.
 */

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
};

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
  const timeoutMs = 20_000;
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
    throw new ApiError(
      aborted
        ? "GYSH API timed out. If you're on local Dev, restart `npm run dev` (Pages Functions on :8788 may be stuck)."
        : "Cannot reach the GYSH API. Database/API is unavailable — check deploy bindings and network.",
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  return (await res.json()) as T;
}

export async function apiHealth(): Promise<{ ok: boolean; db: string; users: number }> {
  return api("health", { auth: false });
}
