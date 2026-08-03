import { describe, expect, it } from "vitest";
import {
  getMoneyModelDraft,
  MONEY_MODEL_DRAFTS,
  normalizeMoneyModelDraftId,
  T022_DRAFT2_AGREEMENT_NOTE,
} from "../partnership-money-model";

describe("partnership money model drafts", () => {
  it("exposes Draft 1 and Draft 2", () => {
    expect(MONEY_MODEL_DRAFTS.map((d) => d.meta.id)).toEqual(["draft1", "draft2"]);
    expect(getMoneyModelDraft("draft1").meta.tabLabel).toMatch(/Draft 1/i);
    expect(getMoneyModelDraft("draft2").meta.tabLabel).toMatch(/Draft 2/i);
  });

  it("normalizes draft query ids", () => {
    expect(normalizeMoneyModelDraftId("draft2")).toBe("draft2");
    expect(normalizeMoneyModelDraftId("2")).toBe("draft2");
    expect(normalizeMoneyModelDraftId("draft1")).toBe("draft1");
    expect(normalizeMoneyModelDraftId(undefined)).toBe("draft1");
  });

  it("Draft 2 encodes Tina Aug 2026 terms", () => {
    const draft2 = getMoneyModelDraft("draft2");
    const blob = JSON.stringify(draft2);
    expect(blob).toMatch(/10,?000/);
    expect(blob).toMatch(/Kevina/i);
    expect(blob).toMatch(/\$50/);
    expect(blob).toMatch(/does not accumulate|never accrues|no accrual/i);
    expect(blob).toMatch(/T-052|Navy Federal/i);
    expect(blob).toMatch(/T-022/);
  });

  it("T-022 agreement note cross-refs Draft 2 + Navy Fed task T-052", () => {
    expect(T022_DRAFT2_AGREEMENT_NOTE).toMatch(/Build Credit \$10,000/);
    expect(T022_DRAFT2_AGREEMENT_NOTE).toMatch(/Kevina Starr/);
    expect(T022_DRAFT2_AGREEMENT_NOTE).toMatch(/\$50/);
    expect(T022_DRAFT2_AGREEMENT_NOTE).toMatch(/T-052/);
    expect(T022_DRAFT2_AGREEMENT_NOTE).toMatch(/Navy Federal/);
  });
});
