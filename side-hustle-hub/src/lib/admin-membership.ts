/**
 * Admin membership updates + the complimentary Starter promise (first N members).
 * Slots are stamped on users.notes so Memberships and Users Area stay in sync.
 * Older notes used `FOUNDING-STARTER n/5`; new stamps use the current limit.
 */

import { MEMBERSHIP_TIERS, TIER_LADDER, type TierId } from "./membership";

export const FOUNDING_STARTER_LIMIT = 7;
export const FOUNDING_STARTER_TAG = "FOUNDING-STARTER";

const GRANT_RE = /FOUNDING-STARTER\s+(\d+)\s*\/\s*\d+\b/i;

export type FoundingStarterGrant = {
  userId: string;
  name: string;
  email: string;
  slot: number;
  notes: string;
};

export type FoundingStarterSlot = {
  slot: number;
  grant: FoundingStarterGrant | null;
};

export type AdminMembershipUpdate =
  | {
      ok: true;
      membershipTier: TierId;
      notify: boolean;
      complimentaryFoundingStarter: boolean;
    }
  | { ok: false; error: string };

type NotesUser = {
  id?: string | null;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  notes?: string | null;
};

export function normalizeAdminMembershipTier(raw: unknown): TierId | null {
  const tier = String(raw || "").trim().toLowerCase();
  if ((TIER_LADDER as readonly string[]).includes(tier)) return tier as TierId;
  return null;
}

export function adminMembershipTierLabel(tier: string | null | undefined): string {
  const id = normalizeAdminMembershipTier(tier) ?? "free";
  return MEMBERSHIP_TIERS.find((t) => t.id === id)?.name ?? "Free";
}

export function parseFoundingStarterSlot(notes: string | null | undefined): number | null {
  const match = String(notes || "").match(GRANT_RE);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isInteger(n) || n < 1 || n > FOUNDING_STARTER_LIMIT) return null;
  return n;
}

export function hasFoundingStarterGrant(notes: string | null | undefined): boolean {
  return parseFoundingStarterSlot(notes) != null;
}

export function foundingStarterGrants(users: readonly NotesUser[]): FoundingStarterGrant[] {
  const grants: FoundingStarterGrant[] = [];
  for (const user of users) {
    const slot = parseFoundingStarterSlot(user.notes);
    if (!slot) continue;
    grants.push({
      userId: String(user.id || user.userId || "").trim(),
      name: String(user.name || "").trim() || "Member",
      email: String(user.email || "").trim(),
      slot,
      notes: String(user.notes || ""),
    });
  }
  grants.sort((a, b) => a.slot - b.slot || a.name.localeCompare(b.name));
  return grants;
}

export function nextFoundingStarterSlot(users: readonly NotesUser[]): number | null {
  const used = new Set(foundingStarterGrants(users).map((g) => g.slot));
  for (let slot = 1; slot <= FOUNDING_STARTER_LIMIT; slot += 1) {
    if (!used.has(slot)) return slot;
  }
  return null;
}

export function foundingStarterSlotsRemaining(users: readonly NotesUser[]): number {
  return Math.max(0, FOUNDING_STARTER_LIMIT - foundingStarterGrants(users).length);
}

export function foundingStarterSlots(users: readonly NotesUser[]): FoundingStarterSlot[] {
  const bySlot = new Map(foundingStarterGrants(users).map((g) => [g.slot, g]));
  return Array.from({ length: FOUNDING_STARTER_LIMIT }, (_, i) => {
    const slot = i + 1;
    return { slot, grant: bySlot.get(slot) ?? null };
  });
}

export function buildFoundingStarterStamp(opts: {
  slot: number;
  actorEmail: string;
  grantedOn?: string;
}): string {
  const day = String(opts.grantedOn || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const actor = String(opts.actorEmail || "admin").trim() || "admin";
  return `${FOUNDING_STARTER_TAG} ${opts.slot}/${FOUNDING_STARTER_LIMIT} complimentary Starter granted ${day} by ${actor}`;
}

export function appendFoundingStarterStamp(notes: string | null | undefined, stamp: string): string {
  const prev = String(notes || "").trim();
  if (hasFoundingStarterGrant(prev)) return prev.slice(0, 1900);
  return `${prev}${prev ? " · " : ""}${stamp}`.slice(0, 1900);
}

export function parseAdminMembershipUpdate(body: unknown): AdminMembershipUpdate {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Choose a membership level." };
  }
  const raw = body as Record<string, unknown>;
  const membershipTier = normalizeAdminMembershipTier(raw.membershipTier ?? raw.tier);
  if (!membershipTier) {
    return { ok: false, error: "Choose Free, Starter, Pro, or Elite." };
  }
  const complimentaryFoundingStarter =
    raw.complimentaryFoundingStarter === true ||
    raw.foundingStarter === true ||
    String(raw.complimentaryFoundingStarter || "").toLowerCase() === "true";
  const notifyRaw = raw.notify;
  const notify =
    notifyRaw === undefined
      ? membershipTier !== "free"
      : notifyRaw === true || String(notifyRaw).toLowerCase() === "true";
  return { ok: true, membershipTier, notify, complimentaryFoundingStarter };
}

export function foundingStarterGrantBlockReason(opts: {
  complimentary: boolean;
  membershipTier: TierId;
  targetNotes?: string | null;
  existingUsers: readonly NotesUser[];
}): string | null {
  if (!opts.complimentary) return null;
  if (opts.membershipTier !== "starter") {
    return "The complimentary Starter offer is Starter only.";
  }
  if (hasFoundingStarterGrant(opts.targetNotes)) {
    return "This member already used a complimentary Starter slot.";
  }
  if (nextFoundingStarterSlot(opts.existingUsers) == null) {
    return `All ${FOUNDING_STARTER_LIMIT} complimentary Starter slots are already used.`;
  }
  return null;
}
