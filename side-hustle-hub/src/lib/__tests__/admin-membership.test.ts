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

describe("admin membership + complimentary Starter", () => {
  it("parses a valid admin membership update and defaults notify on paid plans", () => {
    expect(parseAdminMembershipUpdate({ membershipTier: "Starter" })).toEqual({
      ok: true,
      membershipTier: "starter",
      notify: true,
      complimentaryFoundingStarter: false,
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
    });
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

  it("still reads older n/5 stamps and opens two extra slots through 7", () => {
    expect(parseFoundingStarterSlot(lynne.notes)).toBe(1);
    expect(hasFoundingStarterGrant(lynne.notes)).toBe(true);
    expect(hasFoundingStarterGrant("plain notes")).toBe(false);
    expect(foundingStarterGrants([lynne])).toHaveLength(1);
    expect(nextFoundingStarterSlot([lynne])).toBe(2);
    expect(foundingStarterSlotsRemaining([lynne])).toBe(6);
    expect(foundingStarterSlots([lynne]).map((s) => Boolean(s.grant))).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(FOUNDING_STARTER_LIMIT).toBe(7);
  });

  it("blocks complimentary grants that are not Starter or that exceed 7 slots", () => {
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
    ).toBeNull();
    expect(nextFoundingStarterSlot(five)).toBe(6);
    expect(foundingStarterSlotsRemaining(five)).toBe(2);

    const seven = Array.from({ length: 7 }, (_, i) => ({
      id: `u-${i + 1}`,
      notes: `FOUNDING-STARTER ${i + 1}/${FOUNDING_STARTER_LIMIT} complimentary Starter granted 2026-09-18 by admin`,
    }));
    expect(
      foundingStarterGrantBlockReason({
        complimentary: true,
        membershipTier: "starter",
        existingUsers: seven,
      }),
    ).toMatch(/already used/i);
    expect(
      foundingStarterGrantBlockReason({
        complimentary: false,
        membershipTier: "elite",
        existingUsers: seven,
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
      "FOUNDING-STARTER 1/7 complimentary Starter granted 2026-09-18 by evelyn@example.com",
    );
    expect(appendFoundingStarterStamp("Joined today", stamp)).toContain(stamp);
    expect(appendFoundingStarterStamp(lynne.notes, stamp)).toBe(lynne.notes);
  });
});
