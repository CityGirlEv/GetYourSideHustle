/**
 * Stripe REST helpers for Cloudflare Pages Functions (no Node SDK required).
 */
import { error, type Env } from "./auth";

export function stripeSecret(env: Env): string | null {
  const key = String(env.STRIPE_SECRET_KEY || "").trim();
  return key || null;
}

export function requireStripeSecret(env: Env): string | Response {
  const key = stripeSecret(env);
  if (!key) {
    return error("Stripe is not configured (missing STRIPE_SECRET_KEY).", 503);
  }
  return key;
}

export function siteOriginFromRequest(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * Where Stripe should send the browser after Checkout.
 * Prefer the app UI origin (Vite :5173 / production site), not the API worker (:8788).
 */
export function checkoutReturnOrigin(
  request: Request,
  opts?: { preferredOrigin?: string | null },
): string {
  const candidates: string[] = [];
  const preferred = String(opts?.preferredOrigin || "").trim();
  if (preferred) candidates.push(preferred);
  const headerOrigin = String(request.headers.get("origin") || "").trim();
  if (headerOrigin) candidates.push(headerOrigin);
  const referer = String(request.headers.get("referer") || "").trim();
  if (referer) {
    try {
      candidates.push(new URL(referer).origin);
    } catch {
      /* ignore */
    }
  }
  candidates.push(siteOriginFromRequest(request));

  for (const raw of candidates) {
    const normalized = normalizeCheckoutOrigin(raw);
    if (normalized) return normalized;
  }
  return "http://localhost:5173";
}

/** Accept http(s) origins; map local Pages API port back to Vite UI. */
export function normalizeCheckoutOrigin(raw: string): string | null {
  let origin: string;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    origin = u.origin;
  } catch {
    return null;
  }
  // Wrangler Pages Functions listen on :8788; the SPA runs on Vite :5173.
  if (/^https?:\/\/(127\.0\.0\.1|localhost):8788$/i.test(origin)) {
    return origin.replace(/8788$/i, "5173").replace(/^https:/i, "http:");
  }
  return origin;
}

/** application/x-www-form-urlencoded body for Stripe API. */
export function encodeStripeForm(
  fields: Record<string, string | number | undefined | null>,
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.join("&");
}

export async function stripeRequest<T>(
  secret: string,
  method: string,
  path: string,
  form?: Record<string, string | number | undefined | null>,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const cleanPath = path.replace(/^\//, "");
  const url = new URL(`https://api.stripe.com/v1/${cleanPath}`);
  const isGet = method.toUpperCase() === "GET";
  if (isGet && form) {
    for (const [key, value] of Object.entries(form)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url.toString(), {
    method,
    headers: {
      authorization: `Bearer ${secret}`,
      ...(isGet ? {} : { "content-type": "application/x-www-form-urlencoded" }),
    },
    body: !isGet && form ? encodeStripeForm(form) : undefined,
  });
  const data = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error?.message || `Stripe request failed (${res.status})`,
    };
  }
  return { ok: true, data };
}

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_status?: string;
  status?: string;
  customer_email?: string | null;
  metadata?: Record<string, string>;
  client_reference_id?: string | null;
  mode?: string;
  amount_total?: number | null;
  currency?: string | null;
  created?: number;
  payment_intent?: string | null;
};

export async function createStripeCheckoutSession(
  secret: string,
  form: Record<string, string | number | undefined | null>,
): Promise<{ ok: true; session: StripeCheckoutSession } | { ok: false; error: string }> {
  const result = await stripeRequest<StripeCheckoutSession>(
    secret,
    "POST",
    "checkout/sessions",
    form,
  );
  if (!result.ok) return { ok: false, error: result.error };
  if (!result.data.url) return { ok: false, error: "Stripe did not return a checkout URL." };
  return { ok: true, session: result.data };
}

export async function retrieveStripeCheckoutSession(
  secret: string,
  sessionId: string,
): Promise<{ ok: true; session: StripeCheckoutSession } | { ok: false; error: string }> {
  const result = await stripeRequest<StripeCheckoutSession>(
    secret,
    "GET",
    `checkout/sessions/${encodeURIComponent(sessionId)}`,
  );
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, session: result.data };
}
