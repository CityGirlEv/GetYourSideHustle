import { describe, expect, it } from "vitest";
import { oneOnOneSessionCount } from "../membership";
import {
  DEFAULT_PREP_MINUTES_PER_SESSION,
  formatPartnerHours,
  formatSplitHours,
  membershipCountScale,
  minutesForMembers,
  scaleTimeLoadTable,
  tierTimeAssumptions,
} from "../membership-time-estimate";

describe("membership time load estimates", () => {
  it("uses included 1-on-1 counts from the membership catalog", () => {
    expect(oneOnOneSessionCount("free")).toBe(0);
    expect(oneOnOneSessionCount("starter")).toBe(1);
    expect(oneOnOneSessionCount("pro")).toBe(2);
    expect(oneOnOneSessionCount("elite")).toBe(3);
    expect(tierTimeAssumptions("starter").liveMinutes).toBe(60);
    expect(tierTimeAssumptions("pro").liveMinutes).toBe(120);
    expect(tierTimeAssumptions("elite").liveMinutes).toBe(180);
    expect(tierTimeAssumptions("starter", DEFAULT_PREP_MINUTES_PER_SESSION).prepMinutes).toBe(15);
    expect(tierTimeAssumptions("pro").prepMinutes).toBe(30);
    expect(tierTimeAssumptions("elite").prepMinutes).toBe(45);
  });

  it("starts the scale at 1 membership then steps by 5", () => {
    expect(membershipCountScale(1)).toEqual([1]);
    expect(membershipCountScale(12)).toEqual([1, 5, 10]);
    expect(membershipCountScale(15)[0]).toBe(1);
    expect(membershipCountScale(15)).toEqual([1, 5, 10, 15]);
  });

  it("scales Starter live+prep across a 3-month commitment", () => {
    const one = minutesForMembers({
      tierId: "starter",
      members: 1,
      horizon: "commitment",
      prepPerSession: 15,
      carePerMonth: 0,
    });
    expect(one).toBe(75);
    expect(
      minutesForMembers({
        tierId: "starter",
        members: 5,
        horizon: "commitment",
        prepPerSession: 15,
        carePerMonth: 0,
      }),
    ).toBe(375);
    expect(
      minutesForMembers({
        tierId: "starter",
        members: 1,
        horizon: "month",
        prepPerSession: 15,
        carePerMonth: 0,
      }),
    ).toBe(25);
  });

  it("builds a table with independent columns per paid tier", () => {
    const rows = scaleTimeLoadTable({
      maxMembers: 5,
      horizon: "commitment",
      prepPerSession: 15,
      carePerMonth: 0,
    });
    expect(rows.map((r) => r.members)).toEqual([1, 5]);
    expect(rows[0]?.byTier.starter.minutes).toBe(75);
    expect(rows[0]?.byTier.pro.minutes).toBe(150);
    expect(rows[0]?.byTier.elite.minutes).toBe(225);
    expect(rows[1]?.byTier.elite.minutes).toBe(1125);
  });

  it("formats hours and a 50/50 partner split", () => {
    expect(formatPartnerHours(45)).toBe("45 min");
    expect(formatPartnerHours(60)).toBe("1 hr");
    expect(formatPartnerHours(90)).toBe("1.5 hr");
    expect(formatSplitHours(90)).toBe("45 min");
  });
});
