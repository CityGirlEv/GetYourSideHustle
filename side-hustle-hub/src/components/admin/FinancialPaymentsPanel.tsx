import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import { ApiError } from "../../lib/api";
import { formatMoney } from "../../lib/gysh-financials";
import {
  fetchPaymentsReport,
  type GyshPayment,
  type PaymentsReport,
} from "../../lib/gysh-payments";
import {
  PAYMENT_PERIOD_PRESETS,
  resolvePaymentPeriodRange,
  type PaymentPeriodPreset,
} from "../../lib/payment-periods";

function kindLabel(kind: string): string {
  if (kind === "membership") return "Memberships";
  if (kind === "alacarte") return "A-la-carte";
  if (kind === "credit_pack") return "Credit packs";
  return kind || "Other";
}

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(45,106,79,0.08)" }}>
              <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>Total collected</div>
              <strong data-testid="financials-payments-total">
                {formatMoney(report?.totals.amountUsd ?? 0)}
              </strong>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(215,198,151,0.35)" }}>
              <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>Payments</div>
              <strong data-testid="financials-payments-count">{report?.totals.count ?? 0}</strong>
            </div>
            {Object.entries(report?.totals.byKind || {}).map(([kind, row]) => (
              <div
                key={kind}
                style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(45,106,79,0.05)" }}
              >
                <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{kindLabel(kind)}</div>
                <strong>
                  {formatMoney(row.amountUsd)} · {row.count}
                </strong>
              </div>
            ))}
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
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" data-testid="financials-payments-table">
                <thead>
                  <tr>
                    <th>When (Chicago)</th>
                    <th>Email</th>
                    <th>Item</th>
                    <th>Kind</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.sessionId}>
                      <td>{formatPaidAt(p.paidAt)}</td>
                      <td>{p.email || "—"}</td>
                      <td>{p.label}</td>
                      <td>{kindLabel(p.kind)}</td>
                      <td>{formatMoney(p.amountCents / 100)}</td>
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
