import { getRuntimeSecret } from "@/lib/env";

/** HMAC secret for inbound auth/suppression email webhooks. */
export function getAuthEmailWebhookSecret(): string | undefined {
  return getRuntimeSecret("AUTH_EMAIL_WEBHOOK_SECRET");
}

/** Bearer token for protected email preview endpoints. */
export function getEmailPreviewSecret(): string | undefined {
  return getRuntimeSecret("EMAIL_PREVIEW_SECRET") ?? getAuthEmailWebhookSecret();
}
