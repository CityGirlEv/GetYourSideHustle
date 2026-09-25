/** Users Area — audit trail helpers (login history + event labels). */

export type UserAuditEvent = {
  at: string;
  action: string;
  email: string;
  detail: string;
};

const ACTION_LABELS: Record<string, string> = {
  login_ok: "Signed in",
  login_failed: "Sign-in failed",
  password_forgot: "Password reset requested",
  password_forgot_email_failed: "Password reset email failed",
  password_reset: "Password updated",
  password_admin_set: "Password set by admin",
  user_upsert: "Account updated",
  user_created: "Account created",
  user_activated: "Account activated",
  user_deleted: "Account deleted",
  membership_cleared: "Membership removed",
  membership_plan_update: "Membership plan updated",
  membership_admin_updated: "Membership updated by admin",
  purchase_credit_pack: "Kid Credit pack purchased",
  purchase_alacarte: "A-la-carte purchased",
  purchase_membership: "Membership purchased",
  purchase: "Purchase",
  payment_updated: "Payment ledger updated",
  credits_granted: "Kid Credits granted",
  credits_removed: "Kid Credits removed",
  stripe_checkout_paid: "Stripe checkout paid",
  stripe_checkout_create: "Stripe checkout started",
  register: "Registered",
  blueprint_claimed: "Blueprint claimed",
  blueprint_saved: "Blueprint saved",
  email_sent: "Email sent",
  email_failed: "Email failed",
  email_skipped: "Email skipped",
};

export function userAuditActionLabel(action: string): string {
  const key = String(action || "").trim();
  return ACTION_LABELS[key] || key.replace(/_/g, " ");
}

/** Format ISO / date string for Users Area (local short). */
export function formatUserAuditAt(at: string | null | undefined): string {
  const raw = String(at || "").trim();
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatLastLoginLabel(at: string | null | undefined): string {
  const raw = String(at || "").trim();
  if (!raw) return "Never";
  return formatUserAuditAt(raw);
}

/** Events for one user email (case-insensitive), newest first. */
export function auditEventsForEmail(
  events: readonly UserAuditEvent[],
  email: string | null | undefined,
): UserAuditEvent[] {
  const want = String(email || "")
    .trim()
    .toLowerCase();
  if (!want) return [];
  return events.filter((e) => String(e.email || "").trim().toLowerCase() === want);
}

/** Latest successful login timestamp from an audit list (or null). */
export function lastLoginAtFromEvents(
  events: readonly UserAuditEvent[],
  email: string | null | undefined,
): string | null {
  for (const e of auditEventsForEmail(events, email)) {
    if (e.action === "login_ok" && e.at) return e.at;
  }
  return null;
}

/** Client-side filter for the Users Area Audit Log tab. */
export function filterAuditEvents(
  events: readonly UserAuditEvent[],
  query: string,
): UserAuditEvent[] {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [...events];
  return events.filter((e) => {
    const hay = `${e.email} ${e.action} ${userAuditActionLabel(e.action)} ${e.detail}`.toLowerCase();
    return hay.includes(q);
  });
}
