import { describe, expect, it } from "vitest";
import {
  appendFoundingStarterStamp,
  buildFoundingStarterStamp,
  FOUNDING_STARTER_LIMIT,
  foundingStarterGrantBlockReason,
  foundingStarterGrants,
  foundingStarterSlots,
  foundingStarterSlotsRemaining,
  hasFoundingStarterGrant,
  adminMembershipFormIsDirty,
  mergeNotesPreservingFoundingGrant,
  mergeSavedAdminUser,
  nextFoundingStarterSlot,
  parseAdminMembershipUpdate,
  parseFoundingStarterSlot,
} from "../admin-membership";

const lynne = {
  id: "u-lynne",
  name: "Lynne",
  email: "lynne@example.com",
  notes: "FOUNDING-STARTER 1/5 complimentary Starter granted 2026-09-18 by evelyn@example.com",
};

describe("admin membership + first-5 complimentary Starter", () => {
  it("parses a valid admin membership update and defaults notify on paid plans", () => {
    expect(parseAdminMembershipUpdate({ membershipTier: "Starter" })).toEqual({
      ok: true,
      membershipTier: "starter",
      notify: true,
      complimentaryFoundingStarter: false,
      membershipExpiresAt: "",
    });
    expect(
      parseAdminMembershipUpdate({
        membershipTier: "free",
        notify: true,
        complimentaryFoundingStarter: true,
      }),
    ).toEqual({
      ok: true,
      membershipTier: "free",
      notify: true,
      complimentaryFoundingStarter: true,
      membershipExpiresAt: "",
    });
    expect(
      parseAdminMembershipUpdate({
        membershipTier: "starter",
        membershipExpiresAt: "2026-12-21",
      }),
    ).toMatchObject({ ok: true, membershipExpiresAt: "2026-12-21" });
  });

  it("rejects missing or invalid tiers", () => {
    expect(parseAdminMembershipUpdate(null)).toEqual({
      ok: false,
      error: "Choose a membership level.",
    });
    expect(parseAdminMembershipUpdate({ membershipTier: "gold" })).toEqual({
      ok: false,
      error: "Choose Free, Starter, Pro, or Elite.",
    });
  });

  it("reads founding-5 stamps and fills the next open slot", () => {
    expect(parseFoundingStarterSlot(lynne.notes)).toBe(1);
    expect(hasFoundingStarterGrant(lynne.notes)).toBe(true);
    expect(hasFoundingStarterGrant("plain notes")).toBe(false);
    expect(foundingStarterGrants([lynne])).toHaveLength(1);
    expect(nextFoundingStarterSlot([lynne])).toBe(2);
    expect(foundingStarterSlotsRemaining([lynne])).toBe(4);
    expect(foundingStarterSlots([lynne]).map((s) => Boolean(s.grant))).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(FOUNDING_STARTER_LIMIT).toBe(5);
  });

  it("blocks complimentary grants that are not Starter or that exceed 5 slots", () => {
    expect(
      foundingStarterGrantBlockReason({
        complimentary: true,
        membershipTier: "pro",
        existingUsers: [],
      }),
    ).toMatch(/starter only/i);
    expect(
      foundingStarterGrantBlockReason({
        complimentary: true,
        membershipTier: "starter",
        targetNotes: lynne.notes,
        existingUsers: [lynne],
      }),
    ).toMatch(/already used/i);

    const five = Array.from({ length: 5 }, (_, i) => ({
      id: `u-${i + 1}`,
      notes: `FOUNDING-STARTER ${i + 1}/5 complimentary Starter granted 2026-09-18 by admin`,
    }));
    expect(
      foundingStarterGrantBlockReason({
        complimentary: true,
        membershipTier: "starter",
        existingUsers: five,
      }),
    ).toMatch(/already used/i);
    expect(
      foundingStarterGrantBlockReason({
        complimentary: false,
        membershipTier: "elite",
        existingUsers: five,
      }),
    ).toBeNull();
  });

  it("stamps notes without duplicating an existing founding grant", () => {
    const stamp = buildFoundingStarterStamp({
      slot: 1,
      actorEmail: "evelyn@example.com",
      grantedOn: "2026-09-18",
    });
    expect(stamp).toBe(
      "FOUNDING-STARTER 1/5 complimentary Starter granted 2026-09-18 by evelyn@example.com",
    );
    expect(appendFoundingStarterStamp("Joined today", stamp)).toContain(stamp);
    expect(appendFoundingStarterStamp(lynne.notes, stamp)).toBe(lynne.notes);
  });

  it("treats checking first-5 on an existing Starter as unsaved work", () => {
    expect(
      adminMembershipFormIsDirty({
        selectedTier: "starter",
        savedTier: "starter",
        complimentary: true,
        alreadyFounding: false,
      }),
    ).toBe(true);
    expect(
      adminMembershipFormIsDirty({
        selectedTier: "starter",
        savedTier: "starter",
        complimentary: false,
        alreadyFounding: false,
      }),
    ).toBe(false);
  });

  it("keeps a founding stamp when edit notes omit it", () => {
    expect(mergeNotesPreservingFoundingGrant("Parent of two", lynne.notes)).toContain(
      "FOUNDING-STARTER 1/5",
    );
    expect(mergeNotesPreservingFoundingGrant(lynne.notes, "older notes")).toBe(lynne.notes);
  });

  it("keeps plan and credits when a profile save omits them", () => {
    const previous = {
      membershipTier: "starter",
      audience: "adult",
      notes: lynne.notes,
      creditBalance: 40,
      lastLoginAt: "2026-09-20T12:00:00.000Z",
      canLogin: true,
    };
    const saved = {
      membershipTier: "starter",
      audience: "adult",
      notes: lynne.notes,
      canLogin: true,
    };
    expect(mergeSavedAdminUser(previous, saved).creditBalance).toBe(40);
    expect(mergeSavedAdminUser(previous, saved).lastLoginAt).toBe(previous.lastLoginAt);
  });
});
