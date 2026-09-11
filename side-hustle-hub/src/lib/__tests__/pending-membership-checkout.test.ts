import { describe, expect, it, beforeEach } from "vitest";
import {
  clearPendingMembershipCheckout,
  pendingShouldResumeCheckout,
  readPendingMembershipCheckout,
  readPendingMerchChoices,
  savePendingMembershipCheckout,
  savePendingMerchChoices,
} from "../pending-membership-checkout";

const memory = new Map<string, string>();

describe("pending membership checkout", () => {
  beforeEach(() => {
    memory.clear();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, String(value));
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => memory.clear(),
      key: (index: number) => [...memory.keys()][index] ?? null,
      get length() {
        return memory.size;
      },
    };
    Object.defineProperty(globalThis, "sessionStorage", {
      value: storage,
      configurable: true,
    });
    clearPendingMembershipCheckout();
  });

  it("saves and reads tier + audience for post-login resume", () => {
    savePendingMembershipCheckout({
      tierId: "pro",
      audience: "adult",
      resumeCheckout: true,
      merchChoices: ["hat", "tshirt"],
    });
    expect(readPendingMembershipCheckout()).toEqual({
      tierId: "pro",
      audience: "adult",
      resumeCheckout: true,
      merchChoices: ["hat", "tshirt"],
    });
    clearPendingMembershipCheckout();
    expect(readPendingMembershipCheckout()).toBeNull();
  });

  it("resumes checkout only for paid adult/senior plans", () => {
    expect(pendingShouldResumeCheckout("starter", "adult")).toBe(true);
    expect(pendingShouldResumeCheckout("elite", "senior")).toBe(true);
    expect(pendingShouldResumeCheckout("free", "adult")).toBe(false);
    expect(pendingShouldResumeCheckout("starter", "kids")).toBe(false);
  });

  it("remembers merch choices across login", () => {
    savePendingMerchChoices(["hat", "tshirt"]);
    expect(readPendingMerchChoices()).toEqual(["hat", "tshirt"]);
  });
});
