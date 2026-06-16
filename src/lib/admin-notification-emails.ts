import { getEnvVariable } from "@/lib/env";

/** Default admin inboxes for *-admin templates (registration alerts, enable notices, etc.). */
export const DEFAULT_ADMIN_NOTIFICATION_EMAILS = [
  "evelyn3@cox.net",
  "sharpebanker@yahoo.com",
  "info@mypartb.com",
  "getpartb@gmail.com",
] as const;

/**
 * Admins who already receive direct *-admin template sends — exclude from [BCC]
 * copies of every outgoing transactional email to avoid duplicates.
 */
export const ADMIN_BCC_EXCLUDED_EMAILS = [
  "evelyn3@cox.net",
  "sharpebanker@yahoo.com",
  "sharpebanker@cox.net",
] as const;

/** Ignored when set via ADMIN_NOTIFICATION_EMAILS (use real inboxes instead). */
const PLACEHOLDER_ADMIN_EMAILS = new Set(["admin@example.com", "admin@example.org"]);

function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isRealAdminEmail(email: string): boolean {
  const normalized = normalizeAdminEmail(email);
  if (!normalized.includes("@")) return false;
  if (PLACEHOLDER_ADMIN_EMAILS.has(normalized)) return false;
  if (normalized.endsWith("@example.com") || normalized.endsWith("@example.org")) return false;
  return true;
}

/** Comma-separated override via ADMIN_NOTIFICATION_EMAILS env var. */
export function getAdminNotificationEmails(): string[] {
  const raw = getEnvVariable("ADMIN_NOTIFICATION_EMAILS");
  const fromEnv = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const configured = fromEnv.filter(isRealAdminEmail);
  const list = configured.length ? configured : [...DEFAULT_ADMIN_NOTIFICATION_EMAILS];
  return Array.from(new Set(list.map(normalizeAdminEmail)));
}

/** Admin inboxes that receive [BCC] copies of non-admin transactional sends. */
export function getAdminBccEmails(): string[] {
  const excluded = new Set(ADMIN_BCC_EXCLUDED_EMAILS.map(normalizeAdminEmail));
  return getAdminNotificationEmails().filter((email) => !excluded.has(email));
}
