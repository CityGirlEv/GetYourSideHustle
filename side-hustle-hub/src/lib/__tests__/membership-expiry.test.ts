import { describe, expect, it } from "vitest";
import {
  addCalendarMonths,
  addMembershipTerm,
  calendarDaysUntil,
  foundingComplimentaryExpiresOn,
  isoDay,
  membershipChargeStatus,
  parseFoundingStarterGrantedOn,
  parseMembershipExpiryInput,
  shouldRevertExpiredMembership,
  shouldSendMembershipRenewalReminder,
  stripeSubscriptionLooksPaid,
  stripeSubscriptionShouldDrop,
} from "../membership-expiry";

describe("membership expiry + renewal reminders", () => {
  it("adds 3 months to a founding activation day", () => {
    expect(addCalendarMonths("2026-06-21", 3)).toBe("2026-09-21");
    expect(addMembershipTerm("2026-06-21", "month")).toBe("2026-09-21");
    expect(addMembershipTerm("2026-06-21", "year")).toBe("2027-06-21");
  });

  it("parses the founding grant date and complimentary window", () => {
    const notes =
      "FOUNDING-STARTER 1/5 complimentary Starter granted 2026-06-21 by evelyn@example.com";
    expect(parseFoundingStarterGrantedOn(notes)).toBe("2026-06-21");
    expect(foundingComplimentaryExpiresOn(notes)).toBe("2026-09-21");
  });

  it("sends a reminder in the week before renewal and not twice", () => {
    expect(
      shouldSendMembershipRenewalReminder({
        expiresOn: "2026-09-28",
        today: "2026-09-21",
        membershipTier: "starter",
      }),
    ).toBe(true);
    expect(
      shouldSendMembershipRenewalReminder({
        expiresOn: "2026-09-28",
        today: "2026-09-21",
        alreadyRemindedFor: "2026-09-28",
        membershipTier: "starter",
      }),
    ).toBe(false);
    expect(
      shouldSendMembershipRenewalReminder({
        expiresOn: "2026-09-28",
        today: "2026-09-10",
        membershipTier: "starter",
      }),
    ).toBe(false);
  });

  it("reverts expired paid/complimentary plans and labels charge status", () => {
    expect(
      shouldRevertExpiredMembership({
        membershipTier: "starter",
        expiresOn: "2026-09-21",
        today: "2026-09-21",
      }),
    ).toBe(true);
    expect(
      shouldRevertExpiredMembership({
        membershipTier: "starter",
        expiresOn: "2026-09-22",
        today: "2026-09-21",
      }),
    ).toBe(false);
    expect(
      membershipChargeStatus({
        membershipTier: "starter",
        notes: "FOUNDING-STARTER 2/5 complimentary Starter granted 2026-06-21 by evelyn",
      }).kind,
    ).toBe("complimentary");
    expect(
      membershipChargeStatus({
        membershipTier: "pro",
        lastPaidAt: "2026-09-01T12:00:00.000Z",
      }).label,
    ).toMatch(/2026-09-01/);
    expect(membershipChargeStatus({ membershipTier: "elite" }).kind).toBe("unpaid");
    expect(parseMembershipExpiryInput("2026-12-01")).toEqual({ ok: true, value: "2026-12-01" });
    expect(parseMembershipExpiryInput("nope").ok).toBe(false);
    expect(isoDay("2026-09-21T15:00:00.000Z")).toBe("2026-09-21");
    expect(calendarDaysUntil("2026-09-28", "2026-09-21")).toBe(7);
    expect(stripeSubscriptionLooksPaid("active")).toBe(true);
    expect(stripeSubscriptionShouldDrop("canceled")).toBe(true);
  });
});
