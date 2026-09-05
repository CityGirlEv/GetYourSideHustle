/** QA contacts + email_log filtering for Daily Progress Report. */

import { api } from "./api";
import { toIsoDate } from "./gysh-time-entries";
import {
  allQaTestersForProgress,
  qaTesterIdForUser,
  userEligibleForQaAssigneeList,
  userHasRole,
  type GyshUser,
} from "./gysh-roles";

export type ProgressEmailLogEntry = {
  id: string;
  templateSlug: string;
  toEmail: string;
  userId: string | null;
  subject: string;
  status: string;
  providerId: string | null;
  error: string;
  createdAt: string;
};

export type ProgressQaContact = {
  id: string;
  shortName: string;
  name: string;
  emails: string[];
};

export type ProgressQaEmailRow = ProgressEmailLogEntry & { toName: string };

/** Known seed QA inboxes — used when Users Area has not loaded yet. */
export const CATALOG_QA_EMAILS: Record<string, readonly string[]> = {
  tina: ["tinamariebarham@gmail.com"],
  evelyn: ["evelyn3@cox.net", "evvelyn3@cox.net"],
  lyriq: ["leegaulden1222@icloud.com"],
  candace: ["candacejackson1@icloud.com"],
};

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || "").slice(0, 10);
  return toIsoDate(d);
}

export function progressQaContacts(users: readonly GyshUser[] = []): ProgressQaContact[] {
  const testers = allQaTestersForProgress(users);
  return testers.map((t) => {
    const emails = new Set(
      (CATALOG_QA_EMAILS[t.id] ?? []).map((e) => e.toLowerCase()),
    );
    for (const u of users) {
      if (!userEligibleForQaAssigneeList(u) && !userHasRole(u, "admin")) continue;
      const id = qaTesterIdForUser(u);
      const first = String(u.name || "")
        .trim()
        .split(/\s+/)[0]
        ?.toLowerCase();
      if (id === t.id || first === t.shortName.toLowerCase()) {
        emails.add(String(u.email || "").trim().toLowerCase());
      }
    }
    emails.delete("");
    return {
      id: t.id,
      shortName: t.shortName,
      name: t.name,
      emails: [...emails],
    };
  });
}

export function contactForQaEmail(
  toEmail: string,
  contacts: readonly ProgressQaContact[],
): ProgressQaContact | undefined {
  const want = String(toEmail || "").trim().toLowerCase();
  if (!want) return undefined;
  return contacts.find((c) => c.emails.includes(want));
}

export function filterQaEmailLog(
  entries: readonly ProgressEmailLogEntry[],
  contacts: readonly ProgressQaContact[],
  opts?: { people?: readonly string[]; from?: string; to?: string },
): ProgressQaEmailRow[] {
  const people = new Set(
    (opts?.people ?? []).filter((p) => p !== "Both" && p !== "Unassigned"),
  );
  const from = String(opts?.from || "").slice(0, 10);
  const to = String(opts?.to || "").slice(0, 10);
  const out: ProgressQaEmailRow[] = [];
  for (const row of entries) {
    const contact = contactForQaEmail(row.toEmail, contacts);
    if (!contact) continue;
    if (people.size > 0 && !people.has(contact.shortName)) continue;
    const day = dayKey(row.createdAt);
    if (from && day < from) continue;
    if (to && day > to) continue;
    out.push({ ...row, toName: contact.shortName });
  }
  return out;
}

export function emailCountForContact(
  rows: readonly ProgressQaEmailRow[],
  shortName: string,
): number {
  const want = shortName.toLowerCase();
  return rows.filter((r) => r.toName.toLowerCase() === want).length;
}

export async function fetchQaEmailLog(): Promise<ProgressEmailLogEntry[]> {
  const data = await api<{ entries: ProgressEmailLogEntry[] }>("email/log?qa=1&limit=200");
  return data.entries ?? [];
}
