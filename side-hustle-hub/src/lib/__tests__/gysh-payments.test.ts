import { describe, expect, it } from "vitest";
import {
  filterGyshPayments,
  paymentKindLabel,
  paymentMemberDisplayName,
  paymentTotalsCategoryLabel,
  summarizeGyshPayments,
} from "../gysh-payments";

const sample = [
  {
    id: "pay-cs_1",
    sessionId: "cs_1",
    kind: "credit_pack",
    email: "parent@example.com",
    memberName: "Pat Parent",
    label: "Credit pack · boost",
    amountCents: 500,
  },
  {
    id: "pay-cs_2",
    sessionId: "cs_2",
    kind: "alacarte",
    email: "guest@example.com",
    memberName: "",
    label: "A-la-carte · consult-30x1",
    amountCents: 7500,
  },
  {
    id: "pay-cs_3",
    sessionId: "cs_3",
    kind: "membership",
    tier: "pro",
    email: "pro@example.com",
    memberName: "Pro Member",
    label: "Pro · adult · monthly",
    amountCents: 3900,
  },
];

describe("gysh-payments filters", () => {
  it("labels kinds", () => {
    expect(paymentKindLabel("credit_pack")).toBe("Credit packs");
    expect(paymentKindLabel("alacarte")).toBe("A-la-carte");
    expect(paymentKindLabel("membership")).toBe("Memberships");
  });

  it("shows member name or a dash", () => {
    expect(paymentMemberDisplayName({ memberName: "Pat Parent" })).toBe("Pat Parent");
    expect(paymentMemberDisplayName({ memberName: "  ", email: "a@b.com" })).toBe("—");
  });

  it("filters by kind and search (name, email, item)", () => {
    expect(filterGyshPayments(sample, { kind: "credit_pack" }).map((p) => p.id)).toEqual(["pay-cs_1"]);
    expect(filterGyshPayments(sample, { query: "pat parent" }).map((p) => p.id)).toEqual(["pay-cs_1"]);
    expect(filterGyshPayments(sample, { query: "consult-30" }).map((p) => p.id)).toEqual(["pay-cs_2"]);
    expect(filterGyshPayments(sample, { kind: "membership", query: "pro@" }).map((p) => p.id)).toEqual([
      "pay-cs_3",
    ]);
  });

  it("summarizes membership by level in totals", () => {
    const totals = summarizeGyshPayments(filterGyshPayments(sample, { kind: "all" }));
    expect(totals.count).toBe(3);
    expect(totals.amountUsd).toBe(119);
    expect(totals.byKind.credit_pack?.count).toBe(1);
    expect(totals.byKind["membership:pro"]?.count).toBe(1);
    expect(paymentTotalsCategoryLabel("membership:pro")).toBe("Membership · Pro");
  });
});
