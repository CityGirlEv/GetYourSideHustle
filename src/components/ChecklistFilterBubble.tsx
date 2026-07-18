import { benchmarkReportTabButtonClass } from "@/lib/benchmark-report-ui";
import type { ChecklistProgressCount } from "@/lib/submission-checklist-data";
import { cn } from "@/lib/utils";

type ChecklistFilterBubbleProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  progress?: ChecklistProgressCount;
  className?: string;
};

/** Channel / owner filter bubble — emerald active tab styling with optional complete/total counts. */
export function ChecklistFilterBubble({
  label,
  active,
  onClick,
  progress,
  className,
}: ChecklistFilterBubbleProps) {
  const countLabel =
    progress != null ? `${progress.done} of ${progress.total} complete` : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={countLabel}
      aria-label={countLabel ? `${label}, ${countLabel}` : label}
      className={cn(
        benchmarkReportTabButtonClass(active),
        "text-[11px] px-2 py-1",
        className,
      )}
    >
      {label}
      {progress != null ? (
        <span className="ml-1 tabular-nums opacity-90" aria-hidden>
          {progress.done}/{progress.total}
        </span>
      ) : null}
    </button>
  );
}
