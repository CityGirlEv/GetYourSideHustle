import { EmailAPIError } from "@/lib/email/api-error";
import { getEnvVariable, getRuntimeSecret } from "@/lib/env";

export const DEFAULT_EMAIL_DOMAIN = "mypartb.com";
export const DEFAULT_TRANSACTIONAL_FROM = `Get Part B Optimizer <noreply@${DEFAULT_EMAIL_DOMAIN}>`;
export const RESEND_SANDBOX_FROM = "Get Part B Optimizer <onboarding@resend.dev>";

export function getTransactionalSenderDomain(): string {
  return getEnvVariable("EMAIL_SENDER_DOMAIN") ?? DEFAULT_EMAIL_DOMAIN;
}

export function getTransactionalFromAddress(): string {
  return getEnvVariable("EMAIL_FROM") ?? DEFAULT_TRANSACTIONAL_FROM;
}

/** Prefix on formatted domain-verification errors (used for retry / DLQ handling). */
export const RESEND_DOMAIN_NOT_VERIFIED_PREFIX = "[resend-domain-not-verified]";

/** True when Resend rejects delivery because the domain is not verified for this API key. */
export function isResendSandboxRestriction(message: string): boolean {
  if (message.includes(RESEND_DOMAIN_NOT_VERIFIED_PREFIX)) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes("testing emails") ||
    lower.includes("verify a domain") ||
    lower.includes("domain is not verified") ||
    (lower.includes("not verified") && lower.includes("domain"))
  );
}

export function formatResendDeliveryError(status: number, body: string): string {
  if (status === 403 && isResendSandboxRestriction(body)) {
    const from = getTransactionalFromAddress();
    let detail = body.trim();
    let accountHint = "";
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) {
        detail = parsed.message;
        const ownerMatch = parsed.message.match(/your own email address \(([^)]+)\)/i);
        if (ownerMatch?.[1]) {
          accountHint =
            ` RESEND_API_KEY belongs to Resend account ${ownerMatch[1]} — ` +
            "replace it with the API key from the account where mypartb.com is verified (evelyn3@cox.net).";
        }
      }
    } catch {
      // keep raw body
    }
    return (
      `${RESEND_DOMAIN_NOT_VERIFIED_PREFIX} Resend rejected send from ${from}.` +
      accountHint +
      " Upload the correct key: node scripts/upload-resend-secret.mjs." +
      ` Resend: ${detail}`
    );
  }
  return `Resend error: ${status} ${body}`;
}

export interface QueueEmailPayload {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
  purpose?: string;
  label?: string;
  idempotency_key?: string;
  unsubscribe_token?: string;
  message_id?: string;
  run_id?: string;
  sender_domain?: string;
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const parsed = Number(header);
  if (!Number.isNaN(parsed)) return parsed;
  const date = new Date(header);
  if (!Number.isNaN(date.getTime())) {
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
  }
  return null;
}

async function sendViaResendRequest(
  payload: QueueEmailPayload,
  apiKey: string,
  from: string,
): Promise<void> {
  const trimmedKey = apiKey.trim();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${trimmedKey}`,
    "Content-Type": "application/json",
  };
  if (payload.idempotency_key) {
    headers["Idempotency-Key"] = payload.idempotency_key;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const safeErrorText = errorText.length > 500 ? `${errorText.slice(0, 500)}...` : errorText;
    throw new EmailAPIError(
      response.status,
      formatResendDeliveryError(response.status, safeErrorText),
      parseRetryAfter(response.headers.get("Retry-After")),
    );
  }
}

async function sendViaResend(payload: QueueEmailPayload, apiKey: string): Promise<void> {
  const preferredFrom = payload.from ?? getTransactionalFromAddress();
  try {
    await sendViaResendRequest(payload, apiKey, preferredFrom);
  } catch (error) {
    const canUseSandboxFrom =
      error instanceof EmailAPIError &&
      error.status === 403 &&
      isResendSandboxRestriction(error.message) &&
      preferredFrom !== RESEND_SANDBOX_FROM;

    if (canUseSandboxFrom) {
      console.warn(
        "[email] Retrying with Resend test sender (onboarding@resend.dev); " +
          "only the Resend account owner can receive these. " +
          "Update RESEND_API_KEY if mypartb.com is already verified.",
        { to: payload.to, label: payload.label },
      );
      await sendViaResendRequest(payload, apiKey, RESEND_SANDBOX_FROM);
      return;
    }
    throw error;
  }
}

/** Send a queued transactional email via Resend. */
export async function sendTransactionalEmail(payload: QueueEmailPayload): Promise<void> {
  const resendKey = getRuntimeSecret("RESEND_API_KEY");
  if (!resendKey) {
    throw new Error(
      "Missing RESEND_API_KEY. Add it in Cloudflare Pages → mypartb → Settings → Environment variables (production secret).",
    );
  }

  await sendViaResend(payload, resendKey);
}

export { EmailAPIError };




