import { FileText } from "lucide-react";

type Props = {
  className?: string;
  /** Navigate to the Daily Progress admin page. */
  onOpen: () => void;
};

/** Admin Studio header control — opens the Daily Progress page (filters live on that page). */
export function DailyProgressReport({ className, onOpen }: Props) {
  return (
    <div className={`daily-progress-report ${className ?? ""}`.trim()}>
      <div className="daily-progress-report__controls">
        <button
          type="button"
          className="daily-progress-report__btn"
          onClick={onOpen}
          data-testid="daily-progress-report-btn"
        >
          <FileText size={15} aria-hidden="true" />
          Daily Progress Report
        </button>
      </div>
    </div>
  );
}
