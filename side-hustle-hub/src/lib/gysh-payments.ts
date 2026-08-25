/** Client helpers for Financials → Payments reports. */
import { api } from "./api";
import type { PaymentPeriodPreset, PaymentPeriodRange } from "./payment-periods";

export type GyshPayment = {
  id: string;
  sessionId: string;
  paymentIntentId: string;
  email: string;
  userId: string | null;
  kind: string;
  tier: string;
  audience: string;
  interval: string;
  label: string;
  amountCents: number;
  currency: string;
  paidAt: string;
  source: string;
};

export type PaymentsReport = {
  ok: boolean;
  period: PaymentPeriodRange;
  totals: {
    count: number;
    amountCents: number;
    amountUsd: number;
    byKind: Record<string, { count: number; amountCents: number; amountUsd: number }>;
  };
  payments: GyshPayment[];
  stripeError?: string | null;
  mode?: "test" | "live";
};

export async function fetchPaymentsReport(input: {
  period: PaymentPeriodPreset;
  from?: string;
  to?: string;
}): Promise<PaymentsReport> {
  const params = new URLSearchParams();
  params.set("period", input.period);
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  return api<PaymentsReport>(`financials/payments?${params.toString()}`, {
    method: "GET",
    timeoutMs: 60_000,
  });
}
