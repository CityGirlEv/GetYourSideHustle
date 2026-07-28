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

/** Chevron beside a collapsible heading (pairs with ShowHideToggle). */
export function ShowHideChevron({
  open,
  size = 18,
}: {
  open: boolean;
  size?: number;
}) {
  return open ? (
    <ChevronDown size={size} className="show-hide-chevron" aria-hidden />
  ) : (
    <ChevronRight size={size} className="show-hide-chevron" aria-hidden />
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
