/**
 * Renders a guide step description with interactive ☐ checklist lines.
 * Clicks on those items do not bubble to the parent step “done” toggle.
 */

import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { Check } from "lucide-react";
import {
  guideStepChecklistItemKey,
  parseGuideStepDesc,
  stepDescHasChecklist,
} from "../lib/guide-step-checklist";

export function GuideStepDesc({
  guideId,
  stepIdx,
  desc,
  muted = false,
  checkedItems,
  onToggleItem,
}: {
  guideId: string;
  stepIdx: number;
  desc: string;
  muted?: boolean;
  checkedItems: Record<string, boolean>;
  onToggleItem: (itemIdx: number) => void;
}) {
  if (!stepDescHasChecklist(desc)) {
    return (
      <span
        className="guide-step-desc"
        style={{
          color: muted ? "var(--text-muted)" : "var(--text-secondary)",
          fontSize: "0.95rem",
          whiteSpace: "pre-wrap",
        }}
      >
        {desc}
      </span>
    );
  }

  const segments = parseGuideStepDesc(desc);

  return (
    <div
      className="guide-step-desc guide-step-desc--checklist"
      style={{
        color: muted ? "var(--text-muted)" : "var(--text-secondary)",
        fontSize: "0.95rem",
      }}
    >
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return (
            <span key={`t-${i}`} className="guide-step-desc__text" style={{ whiteSpace: "pre-wrap" }}>
              {seg.text}
              {"\n"}
            </span>
          );
        }
        const key = guideStepChecklistItemKey(guideId, stepIdx, seg.index);
        const checked = checkedItems[key] ?? seg.checkedMarker;
        return (
          <label
            key={key}
            className={`guide-step-desc__check${checked ? " is-checked" : ""}`}
            data-testid={`guide-step-check-${guideId}-${stepIdx}-${seg.index}`}
            onClick={(e: ReactMouseEvent) => {
              e.stopPropagation();
            }}
            onKeyDown={(e: ReactKeyboardEvent) => {
              e.stopPropagation();
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                e.stopPropagation();
                onToggleItem(seg.index);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={seg.label || `Checklist item ${seg.index + 1}`}
            />
            <span className="guide-step-desc__box" aria-hidden>
              {checked ? <Check size={11} strokeWidth={3} /> : null}
            </span>
            <span className="guide-step-desc__label">{seg.label}</span>
          </label>
        );
      })}
    </div>
  );
}
