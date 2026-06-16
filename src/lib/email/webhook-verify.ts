import { getEnvVariable } from "@/lib/env";

export type WebhookErrorCode =
  | "missing_secret"
  | "missing_timestamp"
  | "invalid_timestamp"
  | "stale_timestamp"
  | "invalid_signature"
  | "body_too_large"
  | "invalid_json"
  | "invalid_payload";

export class WebhookError extends Error {
  readonly code: WebhookErrorCode;

  constructor(code: WebhookErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export interface EmailWebhookPayload {
  version: string;
  type: string;
  run_id?: string;
  data?: Record<string, unknown> & {
    email?: string;
    action_type?: string;
    url?: string;
    token?: string;
    new_email?: string;
    old_email?: string;
  };
}

const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000;
const DEFAULT_MAX_BODY_BYTES = 1 << 20;

function webhookSignatureHeader(): string {
  return getEnvVariable("AUTH_WEBHOOK_SIGNATURE_HEADER") ?? "x-webhook-signature";
}

function webhookTimestampHeader(): string {
  return getEnvVariable("AUTH_WEBHOOK_TIMESTAMP_HEADER") ?? "x-webhook-timestamp";
}

async function computeSignature(signedPayload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  return (
    "sha256=" +
    Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyWebhookSignature({
  signedPayload,
  signature,
  secret,
  secrets,
}: {
  signedPayload: string;
  signature: string | null;
  secret?: string;
  secrets?: string[];
}): Promise<boolean> {
  if (!signature) return false;
  const candidates = [secret, ...(secrets ?? [])].filter(Boolean) as string[];
  if (candidates.length === 0) {
    throw new WebhookError("missing_secret", "Missing webhook secret");
  }
  for (const candidate of candidates) {
    const expected = await computeSignature(signedPayload, candidate);
    if (constantTimeEqual(signature, expected)) return true;
  }
  return false;
}

function parseTimestamp(timestamp: string): number {
  const numeric = Number(timestamp);
  if (Number.isFinite(numeric)) {
    if (Math.abs(numeric) < 1e12) return numeric * 1000;
    return numeric;
  }
  const parsed = Date.parse(timestamp);
  if (!Number.isNaN(parsed)) return parsed;
  throw new WebhookError("invalid_timestamp", "Invalid webhook timestamp");
}

export function parseEmailWebhookPayload(body: string): EmailWebhookPayload {
  const parsed = JSON.parse(body);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid email webhook payload: missing version or type");
  }
  const payload = parsed as EmailWebhookPayload;
  if (typeof payload.version !== "string" || typeof payload.type !== "string") {
    throw new Error("Invalid email webhook payload: missing version or type");
  }
  return payload;
}

export async function verifyWebhookRequest<TPayload = unknown>({
  req,
  secret,
  secrets,
  toleranceMs = DEFAULT_TOLERANCE_MS,
  maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
  parser,
}: {
  req: Request;
  secret?: string;
  secrets?: string[];
  toleranceMs?: number;
  maxBodyBytes?: number;
  parser?: (body: string) => TPayload;
}): Promise<{ body: string; payload: TPayload; timestamp: string }> {
  const signature = req.headers.get(webhookSignatureHeader());
  const timestamp = req.headers.get(webhookTimestampHeader());
  if (!timestamp) {
    throw new WebhookError("missing_timestamp", "Missing webhook timestamp");
  }

  const timestampMs = parseTimestamp(timestamp);
  const skew = Math.abs(Date.now() - timestampMs);
  if (skew > toleranceMs) {
    throw new WebhookError("stale_timestamp", "Webhook timestamp outside tolerance window");
  }

  const body = await req.text();
  if (new TextEncoder().encode(body).length > maxBodyBytes) {
    throw new WebhookError("body_too_large", "Webhook body exceeds size limit");
  }

  const signedPayload = `${timestamp}.${body}`;
  const isValid = await verifyWebhookSignature({ signedPayload, signature, secret, secrets });
  if (!isValid) {
    throw new WebhookError("invalid_signature", "Invalid webhook signature");
  }

  const parseBody = parser ?? ((raw: string) => JSON.parse(raw) as TPayload);
  let payload: TPayload;
  try {
    payload = parseBody(body);
  } catch {
    if (parser) {
      throw new WebhookError("invalid_payload", "Failed to parse webhook payload");
    }
    throw new WebhookError("invalid_json", "Invalid JSON in request body");
  }

  return { body, payload, timestamp };
}
