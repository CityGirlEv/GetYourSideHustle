/** Pure helpers for parent/kid family flows (unit-tested). */

export type ProgressReportCadence = "none" | "daily" | "weekly";
export type FamilyAgeBand = "kids" | "junior";

export function isProgressReportCadence(value: unknown): value is ProgressReportCadence {
  return value === "none" || value === "daily" || value === "weekly";
}

export function isFamilyAgeBand(value: unknown): value is FamilyAgeBand {
  return value === "kids" || value === "junior";
}

/** Normalize a kid display name for profiles. */
export function normalizeChildDisplayName(raw: unknown): string {
  return String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

/**
 * Login email for a kid account when signup only collected a display name.
 * Uses parent plus-addressing: parent+kidslug-id@domain (unique per child profile).
 */
export function derivedKidLoginEmail(
  parentEmail: string,
  childDisplayName: string,
  childProfileId: string,
): string {
  const email = String(parentEmail || "").trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1 || !email.slice(at + 1).includes(".")) {
    throw new Error("Invalid parent email for kid login derivation.");
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const baseLocal = (local.split("+")[0] || local).replace(/[^a-z0-9._-]/gi, "") || "parent";
  const slug =
    normalizeChildDisplayName(childDisplayName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 12) || "kid";
  const short = String(childProfileId || "")
    .replace(/^child-/i, "")
    .replace(/-/g, "")
    .slice(0, 8);
  return `${baseLocal}+${slug}${short ? `-${short}` : ""}@${domain}`;
}

/**
 * Blueprint assignment target:
 * - null / "" / "self" → parent (unassigned from kids)
 * - child profile id → that kid
 */
export function resolveBlueprintAssignee(
  childProfileId: unknown,
): { kind: "self" } | { kind: "child"; childProfileId: string } {
  if (childProfileId == null) return { kind: "self" };
  const raw = String(childProfileId).trim();
  if (!raw || raw.toLowerCase() === "self") return { kind: "self" };
  return { kind: "child", childProfileId: raw };
}

/** Chicago calendar key for daily reports (YYYY-MM-DD). */
export function dailyPeriodKey(isoDate: string): string {
  return isoDate.slice(0, 10);
}

/** Chicago-ish week key (ISO week of the date string). */
export function weeklyPeriodKey(isoDate: string): string {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate.slice(0, 10);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function periodKeyForCadence(
  cadence: Exclude<ProgressReportCadence, "none">,
  isoDate: string,
): string {
  return cadence === "daily" ? dailyPeriodKey(isoDate) : weeklyPeriodKey(isoDate);
}

/** Parent consent must create credentials when parent has no account yet. */
export function parentConsentRequiresPassword(parentAccountExists: boolean): boolean {
  return !parentAccountExists;
}

export function validateRegisterKidInput(input: {
  displayName?: unknown;
  ageBand?: unknown;
  loginEmail?: unknown;
  loginPassword?: unknown;
}): string | null {
  const displayName = normalizeChildDisplayName(input.displayName);
  if (!displayName) return "Enter a first name or nickname for your kid.";
  if (!isFamilyAgeBand(input.ageBand)) return "Choose Kids (4–12) or Teens (13–17).";
  const loginEmail = String(input.loginEmail || "").trim();
  const loginPassword = String(input.loginPassword || "");
  if (!loginEmail.includes("@")) return "Kid login needs a valid email.";
  if (loginPassword.length < 8) return "Kid login password must be at least 8 characters.";
  return null;
}
