import { describe, expect, it } from "vitest";
import {
  adminSimulatePaymentHint,
  adminSimulatePaymentLabel,
  canRequestAdminSimulatePayment,
} from "../admin-simulate-payment";

describe("admin simulate payment", () => {
  it("labels the admin checkout bypass", () => {
    expect(adminSimulatePaymentLabel()).toBe("Pay as Admin");
    expect(adminSimulatePaymentHint()).toMatch(/Simulate payment/i);
  });

  it("allows simulate only when admin and flag are both set", () => {
    expect(canRequestAdminSimulatePayment(true, true)).toBe(true);
    expect(canRequestAdminSimulatePayment(false, true)).toBe(false);
    expect(canRequestAdminSimulatePayment(true, false)).toBe(false);
    expect(canRequestAdminSimulatePayment(false, false)).toBe(false);
  });
});
