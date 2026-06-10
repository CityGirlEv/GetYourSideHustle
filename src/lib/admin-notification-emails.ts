import { getEnvVariable } from '@/lib/env'

/** Default admin BCC inboxes for every outgoing transactional email. */
export const DEFAULT_ADMIN_NOTIFICATION_EMAILS = [
  'evelyn3@cox.net',
  'sharpebanker@yahoo.com',
] as const

/** Ignored when set via ADMIN_NOTIFICATION_EMAILS (use real inboxes instead). */
const PLACEHOLDER_ADMIN_EMAILS = new Set([
  'admin@example.com',
  'admin@example.org',
])

function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isRealAdminEmail(email: string): boolean {
  const normalized = normalizeAdminEmail(email)
  if (!normalized.includes('@')) return false
  if (PLACEHOLDER_ADMIN_EMAILS.has(normalized)) return false
  if (normalized.endsWith('@example.com') || normalized.endsWith('@example.org')) return false
  return true
}

/** Comma-separated override via ADMIN_NOTIFICATION_EMAILS env var. */
export function getAdminNotificationEmails(): string[] {
  const raw = getEnvVariable('ADMIN_NOTIFICATION_EMAILS')
  const fromEnv = raw
    ? raw.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const configured = fromEnv.filter(isRealAdminEmail)
  const list = configured.length ? configured : [...DEFAULT_ADMIN_NOTIFICATION_EMAILS]
  return Array.from(new Set(list.map(normalizeAdminEmail)))
}
