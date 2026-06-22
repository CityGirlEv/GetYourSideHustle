import { useCallback } from "react";
import {
  FACEBOOK_INVITE_DAY_STEPS,
  facebookInviteStepStorageId,
  type FacebookInviteDayStep,
} from "@/lib/content-factory/facebook-invite-day-checklist";
import { facebookPageUrl } from "@/lib/content-factory/facebook-post-copy";

export function FacebookInviteDaySteps({
  completedEvents = {},
  onToggleCompleted,
  compact = false,
}: {
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (eventId: string) => void;
  compact?: boolean;
}) {
  const pageUrl = facebookPageUrl();

  return (
    <div className={`space-y-1 ${compact ? "mt-1" : "mt-2"}`}>
      <p className={`font-semibold text-primary ${compact ? "text-[10px]" : "text-xs"}`}>
        Invite day — whiz through these:
      </p>
      <ol className={`space-y-1 ${compact ? "text-[10px]" : "text-xs"}`}>
        {FACEBOOK_INVITE_DAY_STEPS.map((step, index) => (
          <FacebookInviteStepRow
            key={step.id}
            index={index + 1}
            step={step}
            compact={compact}
            checked={!!completedEvents[facebookInviteStepStorageId(step.id)]}
            onToggle={() => onToggleCompleted?.(facebookInviteStepStorageId(step.id))}
          />
        ))}
      </ol>
      {pageUrl ? (
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center text-primary font-medium hover:text-primary/80 underline-offset-2 hover:underline ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Open Facebook Page
        </a>
      ) : null}
    </div>
  );
}

function FacebookInviteStepRow({
  index,
  step,
  compact,
  checked,
  onToggle,
}: {
  index: number;
  step: FacebookInviteDayStep;
  compact: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const copyCommand = useCallback(() => {
    if (!step.command || typeof navigator?.clipboard?.writeText !== "function") return;
    void navigator.clipboard.writeText(step.command);
  }, [step.command]);

  return (
    <li
      className={`rounded border border-border/50 bg-muted/20 px-2 py-1.5 ${
        checked ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className={`rounded border-input bg-background text-indigo-500 focus:ring-indigo-500/50 cursor-pointer shrink-0 ${
            compact ? "mt-0.5 h-3 w-3" : "mt-0.5 h-3.5 w-3.5"
          }`}
          title={checked ? "Mark active" : "Mark done"}
        />
        <div className="min-w-0 flex-1">
          <span className={checked ? "line-through" : ""}>
            <span className="font-bold tabular-nums text-muted-foreground mr-1">{index}.</span>
            {step.label}
          </span>
          {step.command ? (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <code
                className={`block max-w-full overflow-x-auto rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground/90 ${
                  compact ? "" : "text-[11px]"
                }`}
              >
                {step.command}
              </code>
              <button
                type="button"
                onClick={copyCommand}
                className="text-[10px] font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline"
              >
                Copy
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
