import { ChevronDown } from "lucide-react";
import {
  auditEventsForEmail,
  formatUserAuditAt,
  userAuditActionLabel,
  type UserAuditEvent,
} from "../../lib/gysh-user-audit";

export function UserAuditTrail({
  email,
  events,
  open,
  onToggle,
  testId,
}: {
  email: string;
  events: UserAuditEvent[];
  open: boolean;
  onToggle: () => void;
  testId?: string;
}) {
  const mine = auditEventsForEmail(events, email);
  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        className="btn btn-outline"
        onClick={onToggle}
        aria-expanded={open}
        data-testid={testId}
        style={{
          padding: "6px 10px",
          fontSize: "0.875rem",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <ChevronDown
          size={14}
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
          }}
          aria-hidden
        />
        Audit log ({mine.length})
      </button>
      {open && (
        <ul
          data-testid={testId ? `${testId}-list` : undefined}
          style={{
            listStyle: "none",
            margin: "8px 0 0",
            padding: 0,
            maxHeight: 220,
            overflowY: "auto",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          {mine.length === 0 ? (
            <li style={{ padding: "10px 12px", fontSize: "0.9rem", color: "var(--text-primary)" }}>
              No audit events for this user yet.
            </li>
          ) : (
            mine.map((ev, i) => (
              <li
                key={`${ev.at}-${ev.action}-${i}`}
                style={{
                  padding: "8px 12px",
                  borderTop: i === 0 ? "none" : "1px solid var(--border-color)",
                  fontSize: "0.875rem",
                  color: "var(--charcoal)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{userAuditActionLabel(ev.action)}</div>
                <div style={{ color: "var(--text-primary)", marginTop: 2 }}>
                  {formatUserAuditAt(ev.at)}
                  {ev.detail ? ` · ${ev.detail}` : ""}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
