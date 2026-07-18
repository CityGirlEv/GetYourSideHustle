import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_CATRIA_TASK_FLAGS,
  REVIEW_OWNER_LABEL,
  type CatriaTaskFlags,
} from "@/lib/submission-checklist-data";

export function CatriaTaskFlagControls({
  flags,
  onChange,
  itemLabel,
}: {
  flags: CatriaTaskFlags;
  onChange: (flags: Partial<CatriaTaskFlags>) => void;
  itemLabel?: string;
}) {
  const customized =
    flags.review !== DEFAULT_CATRIA_TASK_FLAGS.review ||
    flags.approve !== DEFAULT_CATRIA_TASK_FLAGS.approve;

  return (
    <details className="text-[10px] text-muted-foreground" open={customized}>
      <summary className="cursor-pointer select-none hover:text-foreground list-none [&::-webkit-details-marker]:hidden">
        <span className="underline-offset-2 hover:underline">
          Configure {REVIEW_OWNER_LABEL} sub-tasks
          {customized ? " (customized)" : ""}
        </span>
      </summary>
      <p className="pt-1 text-[10px] leading-snug">
        Choose which {REVIEW_OWNER_LABEL} steps apply{itemLabel ? ` to ${itemLabel}` : ""}. The
        reviewed and approved checkboxes above track completion.
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-1.5">
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <Checkbox
            checked={flags.review}
            onCheckedChange={(v) => onChange({ review: v === true })}
            aria-label={`Require ${REVIEW_OWNER_LABEL} review${itemLabel ? ` for ${itemLabel}` : ""}`}
          />
          <span>Require review step</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <Checkbox
            checked={flags.approve}
            onCheckedChange={(v) => onChange({ approve: v === true })}
            aria-label={`Require ${REVIEW_OWNER_LABEL} approval${itemLabel ? ` for ${itemLabel}` : ""}`}
          />
          <span>Require approval step</span>
        </label>
      </div>
    </details>
  );
}
