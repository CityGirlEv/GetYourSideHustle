import { CalendarDays, ExternalLink, X } from "lucide-react";
import type { OverdueScheduleItem, ScheduleSuiteSummary } from "../lib/hustle-schedule";

type Props = {
  open: boolean;
  summaries: ScheduleSuiteSummary[];
  overdue: OverdueScheduleItem[];
  onClose: () => void;
  onOpenSchedule: (scheduleId: string) => void;
};

export function ScheduleDuePopup({
  open,
  summaries,
  overdue,
  onClose,
  onOpenSchedule,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-due-popup-title"
      className="schedule-due-popup"
      data-testid="schedule-due-popup"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="glass schedule-due-popup__card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="schedule-due-popup__head">
          <div>
            <h3 id="schedule-due-popup-title">
              <CalendarDays size={20} aria-hidden /> Your Schedule Suites
            </h3>
            <p>
              {overdue.length > 0
                ? `${overdue.length} past-due item${overdue.length === 1 ? "" : "s"} need attention.`
                : "Here are your active Schedule Suites. Nothing is past due right now."}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            aria-label="Close"
            data-testid="schedule-due-popup-close"
          >
            <X size={16} />
          </button>
        </div>

        {overdue.length > 0 && (
          <section className="schedule-due-popup__section" data-testid="schedule-due-overdue">
            <h4>Past due</h4>
            <ul>
              {overdue.map((item, i) => (
                <li key={`${item.scheduleId}-${item.kind}-${item.blockId ?? "plan"}-${i}`}>
                  <div>
                    <strong>{item.scheduleLabel}</strong>
                    <span>
                      {item.kind === "plan"
                        ? `Schedule due ${item.dueDate}`
                        : `${item.dayLabel ?? "Day"} due ${item.dueDate}${
                            item.focus ? ` — ${item.focus}` : ""
                          }`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-testid={`schedule-due-open-${item.scheduleId}`}
                    onClick={() => onOpenSchedule(item.scheduleId)}
                  >
                    <ExternalLink size={14} aria-hidden /> Open
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="schedule-due-popup__section" data-testid="schedule-due-all">
          <h4>All suites</h4>
          {summaries.length === 0 ? (
            <p className="schedule-due-popup__empty">No Schedule Suites saved yet.</p>
          ) : (
            <ul>
              {summaries.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.label}</strong>
                    <span>
                      Due {s.dueDate || "—"}
                      {s.overdueCount > 0
                        ? ` · ${s.overdueCount} past due`
                        : " · on track"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    data-testid={`schedule-due-goto-${s.id}`}
                    onClick={() => onOpenSchedule(s.id)}
                  >
                    <ExternalLink size={14} aria-hidden /> Schedule Suite
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
