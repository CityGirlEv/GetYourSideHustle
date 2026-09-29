import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import { ApiError } from "../../lib/api";
import { formatMoney } from "../../lib/gysh-financials";
import {
  fetchPaymentsReport,
  paymentKindLabel,
  paymentMemberDisplayName,
  paymentTotalsCategoryLabel,
  type GyshPayment,
  type PaymentsReport,
} from "../../lib/gysh-payments";
import {
  PAYMENT_PERIOD_PRESETS,
  resolvePaymentPeriodRange,
  type PaymentPeriodPreset,
} from "../../lib/payment-periods";

function formatPaidAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function FinancialPaymentsPanel() {
  const [period, setPeriod] = useState<PaymentPeriodPreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<PaymentsReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const range =
        period === "custom"
          ? resolvePaymentPeriodRange("custom", { from: customFrom, to: customTo })
          : resolvePaymentPeriodRange(period);
      const data = await fetchPaymentsReport({
        period,
        from: range.from,
        to: range.to,
      });
      setReport(data);
    } catch (e) {
      setReport(null);
      setError(e instanceof ApiError ? e.message : "Could not load payments.");
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    if (period === "custom" && (!customFrom || !customTo)) {
      const today = resolvePaymentPeriodRange("day");
      setCustomFrom(today.from);
      setCustomTo(today.to);
      return;
    }
    void load();
  }, [period, customFrom, customTo, load]);

  const payments: GyshPayment[] = report?.payments ?? [];

  return (
    <div className="glass" style={{ padding: 24, borderRadius: 16 }} data-testid="financials-payments">
      <BusyOverlay active={loading} message="Loading Stripe payments…" />
      <h3 style={{ marginTop: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <CreditCard size={18} style={{ color: "var(--bronze)" }} /> Payments
      </h3>
      <p className="admin-page-lede" style={{ marginTop: 0 }}>
        Stripe Checkout purchases (memberships, a-la-carte, credit packs). Totals use America/Chicago
        calendar days. Source: Stripe{report?.mode ? ` (${report.mode} mode)` : ""}.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {PAYMENT_PERIOD_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`nav-link-btn ${period === p.id ? "active" : ""}`}
            onClick={() => setPeriod(p.id)}
            data-testid={`financials-payments-period-${p.id}`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => void load()}
          disabled={loading}
          style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {period === "custom" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.9375rem" }}>
            From
            <input
              type="date"
              className="text-input"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              data-testid="financials-payments-from"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.9375rem" }}>
            To
            <input
              type="date"
              className="text-input"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              data-testid="financials-payments-to"
            />
          </label>
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            background: "rgba(185,28,28,0.08)",
            color: "#991b1b",
            fontSize: "1rem",
          }}
          role="alert"
        >
          {error}
        </div>
      )}
      {report?.stripeError && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            background: "rgba(185,28,28,0.08)",
            color: "#991b1b",
            fontSize: "0.9375rem",
          }}
        >
          Stripe warning: {report.stripeError}
        </div>
      )}

      {loading && !report ? (
        <WaitIndicator message="Loading payments…" style={{ padding: 24, marginTop: 0 }} />
      ) : (
        <>
          <p style={{ marginTop: 0, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
            {report?.period.label || "—"}
          </p>
          <div className="financials-payments-table-wrap">
            <table className="financials-payments-table" data-testid="financials-payments-summary">
              <caption>Payments received — totals</caption>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="financials-payments-table__num">Payments</th>
                  <th className="financials-payments-table__num">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Total collected</th>
                  <td className="financials-payments-table__num" data-testid="financials-payments-count">
                    {report?.totals.count ?? 0}
                  </td>
                  <td className="financials-payments-table__num" data-testid="financials-payments-total">
                    {formatMoney(report?.totals.amountUsd ?? 0)}
                  </td>
                </tr>
                {Object.entries(report?.totals.byKind || {}).map(([kind, row]) => (
                  <tr key={kind} data-testid={`financials-payments-category-${kind}`}>
                    <th scope="row">{paymentTotalsCategoryLabel(kind)}</th>
                    <td className="financials-payments-table__num">{row.count}</td>
                    <td className="financials-payments-table__num">{formatMoney(row.amountUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 ? (
            <p style={{ color: "var(--text-primary)" }}>
              No paid Stripe checkouts in this range yet.
              {loading ? (
                <>
                  {" "}
                  <WaitLabel>Refreshing…</WaitLabel>
                </>
              ) : null}
            </p>
          ) : (
            <div className="financials-payments-table-wrap">
              <table className="financials-payments-table" data-testid="financials-payments-table">
                <caption>Payments received</caption>
                <thead>
                  <tr>
                    <th>When (Chicago)</th>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Item</th>
                    <th>Kind</th>
                    <th className="financials-payments-table__num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.sessionId}>
                      <td>{formatPaidAt(p.paidAt)}</td>
                      <td>{paymentMemberDisplayName(p)}</td>
                      <td>{p.email || "—"}</td>
                      <td>{p.label}</td>
                      <td>{paymentKindLabel(p.kind)}</td>
                      <td className="financials-payments-table__num">{formatMoney(p.amountCents / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
