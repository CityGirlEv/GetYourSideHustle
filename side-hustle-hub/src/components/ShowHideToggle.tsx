/** Mutually exclusive Show / Hide controls for cascading collapsible sections. */

import { ChevronDown, ChevronRight } from "lucide-react";

type ShowHideToggleProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name for the control group (e.g. section title). */
  label?: string;
  className?: string;
  testId?: string;
  disabled?: boolean;
};

type ShowHideChevronProps = {
  open: boolean;
  size?: number;
  /** When set, chevron is a button that toggles expand/collapse (same as Show/Hide). */
  onOpenChange?: (open: boolean) => void;
  label?: string;
  testId?: string;
  disabled?: boolean;
};

/** Chevron beside a collapsible heading (pairs with ShowHideToggle). */
export function ShowHideChevron({
  open,
  size = 18,
  onOpenChange,
  label,
  testId,
  disabled = false,
}: ShowHideChevronProps) {
  const Icon = open ? ChevronDown : ChevronRight;
  if (!onOpenChange) {
    return <Icon size={size} className="show-hide-chevron" aria-hidden />;
  }
  return (
    <button
      type="button"
      className="show-hide-chevron-btn"
      aria-expanded={open}
      aria-label={
        label
          ? open
            ? `Collapse ${label}`
            : `Expand ${label}`
          : open
            ? "Collapse"
            : "Expand"
      }
      data-testid={testId}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onOpenChange(!open);
      }}
    >
      <Icon size={size} className="show-hide-chevron" aria-hidden />
    </button>
  );
}

/**
 * Show and Hide as separate buttons.
 * When open: Show is disabled, Hide is enabled.
 * When closed: Hide is disabled, Show is enabled.
 */
export function ShowHideToggle({
  open,
  onOpenChange,
  label,
  className,
  testId,
  disabled = false,
}: ShowHideToggleProps) {
  return (
    <span
      className={`show-hide-toggle${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label ? `${label} visibility` : "Section visibility"}
      data-testid={testId}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="show-hide-toggle__btn"
        disabled={disabled || open}
        aria-pressed={open}
        aria-label={label ? `Show ${label}` : "Show"}
        data-testid={testId ? `${testId}-show` : undefined}
        onClick={() => onOpenChange(true)}
      >
        Show
      </button>
      <button
        type="button"
        className="show-hide-toggle__btn"
        disabled={disabled || !open}
        aria-pressed={!open}
        aria-label={label ? `Hide ${label}` : "Hide"}
        data-testid={testId ? `${testId}-hide` : undefined}
        onClick={() => onOpenChange(false)}
      >
        Hide
      </button>
    </span>
  );
}
