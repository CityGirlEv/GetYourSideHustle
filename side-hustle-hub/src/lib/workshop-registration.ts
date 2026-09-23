/** Workshop roster + confirmation copy (admin + public registration). */

export type WorkshopRegistrantStatus = "registered" | "cancelled";

export type WorkshopRegistrant = {
  id: string;
  workshopId: string;
  name: string;
  email: string;
  phone: string;
  attendeeCount: number;
  notes: string;
  status: WorkshopRegistrantStatus;
  createdAt: string;
};

export type WorkshopRegistrationInput = {
  workshopId: string;
  name: string;
  email: string;
  phone?: string;
  attendeeCount: number;
  notes?: string;
};

export function workshopRosterSeatsTaken(
  rows: readonly Pick<WorkshopRegistrant, "attendeeCount" | "status">[],
): number {
  return rows
    .filter((r) => r.status === "registered")
    .reduce((sum, r) => sum + Math.max(0, Number(r.attendeeCount) || 0), 0);
}

export function workshopEmailAlreadyOnRoster(
  rows: readonly Pick<WorkshopRegistrant, "email" | "status">[],
  email: string,
): boolean {
  const needle = String(email || "")
    .trim()
    .toLowerCase();
  if (!needle) return false;
  return rows.some((r) => r.status === "registered" && r.email.trim().toLowerCase() === needle);
}

export function workshopRegistrationConfirmationSubject(workshopTitle: string): string {
  const title = String(workshopTitle || "").trim() || "GYSH workshop";
  return `You're registered — ${title}`;
}

export function workshopRegistrationConfirmationLead(workshopTitle: string): string {
  return `You're on the roster for ${String(workshopTitle || "this GYSH workshop").trim()}.`;
}
