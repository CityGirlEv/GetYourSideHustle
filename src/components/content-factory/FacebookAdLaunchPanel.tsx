import { useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  buildFacebookAdLaunchSteps,
  buildFacebookAdProduceSteps,
  formatFacebookAdScheduleNote,
  getFacebookAdScheduleDates,
  facebookAdAdminHref,
  facebookAdStepCopyContent,
  facebookAdStepCopyLabel,
  facebookAdStepStorageId,
  type FacebookAdLaunchStep,
} from "@/lib/content-factory/facebook-ad-launch";
import type { EditorialMilestone } from "@/lib/content-factory/weekly-editorial-schedule";

function CopyBlock({
  label,
  value,
  compact,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  const copy = useCallback(() => {
    if (typeof navigator?.clipboard?.writeText !== "function") return;
    void navigator.clipboard.writeText(value).then(() => {
      toast.success(`${label} copied`);
    });
  }, [label, value]);

  return (
    <div className="rounded border border-border/60 bg-muted/20 p-2 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className={`font-semibold text-primary ${compact ? "text-[10px]" : "text-xs"}`}>
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
      </div>
      <pre
        className={`whitespace-pre-wrap font-sans text-foreground/90 ${
          compact ? "text-[10px] leading-snug" : "text-xs leading-relaxed"
        }`}
      >
        {value}
      </pre>
    </div>
  );
}

function AdSteps({
  steps,
  eventDate,
  completedEvents,
  onToggleCompleted,
  compact,
}: {
  steps: FacebookAdLaunchStep[];
  eventDate: string;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (storageId: string, legacyId?: string) => void;
  compact?: boolean;
}) {
  return (
    <ol className={`space-y-1 ${compact ? "text-[10px]" : "text-xs"}`}>
      {steps.map((step, index) => {
        const storageId = facebookAdStepStorageId(eventDate, step.id);
        const legacyId = `facebook_ad:${step.id}`;
        const checked = !!(completedEvents?.[storageId] ?? completedEvents?.[legacyId]);
        return (
          <li
            key={step.id}
            className={`rounded border border-border/50 bg-background/50 px-2 py-1.5 ${
              checked ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleCompleted?.(storageId, legacyId)}
                className={`rounded border-input bg-background text-indigo-500 focus:ring-indigo-500/50 cursor-pointer shrink-0 ${
                  compact ? "mt-0.5 h-3 w-3" : "mt-0.5 h-3.5 w-3.5"
                }`}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <span className={checked ? "line-through" : ""}>
                  <span className="font-bold tabular-nums text-muted-foreground mr-1">
                    {index + 1}.
                  </span>
                  {step.label}
                </span>
                {step.detail ? (
                  <p className="text-muted-foreground leading-snug">{step.detail}</p>
                ) : null}
                {(() => {
                  const copyLabel = facebookAdStepCopyLabel(step);
                  const copyValue = facebookAdStepCopyContent(step);
                  if (!copyLabel || !copyValue) return null;
                  return (
                    <CopyBlock compact label={copyLabel} value={copyValue} />
                  );
                })()}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function FacebookAdLaunchPanel({
  milestone,
  eventDate,
  completedEvents,
  onToggleCompleted,
  compact = false,
}: {
  milestone: EditorialMilestone;
  eventDate: string;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (storageId: string, legacyId?: string) => void;
  compact?: boolean;
}) {
  const dates = getFacebookAdScheduleDates();
  const scheduleNote = formatFacebookAdScheduleNote(dates);
  const steps =
    milestone === "produce"
      ? buildFacebookAdProduceSteps(dates)
      : buildFacebookAdLaunchSteps(dates);

  return (
    <div className={`space-y-2 ${compact ? "mt-1" : "mt-2"}`}>
      <p
        className={`rounded-md border border-amber-300/50 bg-amber-50/80 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100 px-2 py-1.5 leading-snug ${
          compact ? "text-[10px]" : "text-xs"
        }`}
      >
        {scheduleNote}
      </p>

      <AdSteps
        steps={steps}
        eventDate={eventDate}
        completedEvents={completedEvents}
        onToggleCompleted={onToggleCompleted}
        compact={compact}
      />

      {milestone === "produce" ? (
        <p
          className={`text-muted-foreground leading-snug ${compact ? "text-[10px]" : "text-xs"}`}
        >
          Full ad copy and Hedra blocks also on{" "}
          <Link to={facebookAdAdminHref("produce")} className="text-primary underline">
            /admin/meta
          </Link>
          . Checklist steps above include copy-paste prompts per scene.
        </p>
      ) : null}

      <div className={`flex flex-wrap gap-x-3 gap-y-1 ${compact ? "" : "pt-1"}`}>
        <a
          href="https://adsmanager.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Open Meta Ads Manager →
        </a>
        <Link
          to={facebookAdAdminHref(milestone)}
          className={`inline-flex font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Full ad page in Meta admin →
        </Link>
      </div>
    </div>
  );
}
