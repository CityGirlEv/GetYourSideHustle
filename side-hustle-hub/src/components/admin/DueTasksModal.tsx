import { ListChecks, X } from "lucide-react";
import {
  TASK_STATUS_LABELS,
  type GyshTask,
} from "../../lib/gysh-tasks";

type Props = {
  open: boolean;
  assigneeLabel: string;
  overdue: GyshTask[];
  dueToday: GyshTask[];
  onClose: () => void;
  onOpenTaskList: () => void;
};

function TaskLine({ t, tone }: { t: GyshTask; tone: "overdue" | "today" }) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "70px 1fr auto auto",
        gap: 10,
        alignItems: "start",
        padding: "10px 0",
        borderBottom: "1px solid var(--border-color)",
        fontSize: "0.88rem",
      }}
    >
      <span className="flat-label flat-label--id">{t.id}</span>
      <span style={{ color: "var(--charcoal)", lineHeight: 1.35 }}>{t.description}</span>
      <span
        style={{
          fontWeight: 700,
          whiteSpace: "nowrap",
          color: tone === "overdue" ? "#9B2F28" : "var(--bronze)",
        }}
      >
        {t.dueDate || "—"}
      </span>
      <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
        {TASK_STATUS_LABELS[t.status]}
      </span>
    </li>
  );
}

export function DueTasksModal({
  open,
  assigneeLabel,
  overdue,
  dueToday,
  onClose,
  onOpenTaskList,
}: Props) {
  if (!open) return null;

  const empty = overdue.length === 0 && dueToday.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="due-tasks-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(24, 23, 24, 0.45)",
      }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="glass"
        style={{
          width: "min(640px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          borderRadius: 16,
          padding: "22px 24px",
          background: "#fff",
          border: "1px solid var(--border-color)",
          boxShadow: "0 18px 48px rgba(24,23,24,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <h3 id="due-tasks-modal-title" style={{ margin: 0, fontSize: "1.25rem", color: "var(--charcoal)" }}>
              Tasks needing attention
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              Due today or past due for {assigneeLabel} (includes Both).
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 8px" }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {empty ? (
          <p style={{ marginTop: 20, color: "var(--text-secondary)" }}>Nothing due today or overdue. Nice work.</p>
        ) : (
          <div style={{ marginTop: 16 }}>
            {overdue.length > 0 && (
              <section style={{ marginBottom: 18 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#9B2F28", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Past due ({overdue.length})
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {overdue.map((t) => (
                    <TaskLine key={t.id} t={t} tone="overdue" />
                  ))}
                </ul>
              </section>
            )}
            {dueToday.length > 0 && (
              <section>
                <h4 style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "var(--bronze)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Due today ({dueToday.length})
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {dueToday.map((t) => (
                    <TaskLine key={t.id} t={t} tone="today" />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Got it
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onOpenTaskList();
              onClose();
            }}
          >
            <ListChecks size={14} /> Open Task List
          </button>
        </div>
      </div>
    </div>
  );
}
