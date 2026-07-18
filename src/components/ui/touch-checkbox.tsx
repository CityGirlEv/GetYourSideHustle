import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type TouchCheckboxProps = {
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
  title?: string;
};

function emitChange(onChange: TouchCheckboxProps["onChange"], checked: boolean) {
  onChange?.({ target: { checked } } as React.ChangeEvent<HTMLInputElement>);
}

function isInteractiveChild(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("a, button, input, textarea, select, label"));
}

/** Visual-only box — avoids nesting Radix Checkbox inside another role=checkbox control. */
function CheckboxIndicator({
  checked,
  disabled,
  className,
  boxClassName,
}: {
  checked: boolean;
  disabled?: boolean;
  className?: string;
  boxClassName?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid place-content-center shrink-0 rounded-sm border h-6 w-6",
        checked
          ? "border-primary bg-primary text-primary-foreground shadow"
          : "border-muted-foreground/35 bg-background shadow-none",
        disabled && "opacity-50",
        className,
        boxClassName,
      )}
    >
      {checked ? <Check className="h-4 w-4" /> : null}
    </span>
  );
}

/** Checkbox with a 44px touch target (tablet-friendly). */
export const TouchCheckbox = React.forwardRef<HTMLButtonElement, TouchCheckboxProps>(
  ({ className, disabled, checked, onChange, ...props }, ref) => {
    const toggle = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (disabled) return;
      emitChange(onChange, !checked);
    };

    return (
      <div
        className={cn(
          "inline-flex items-center justify-center shrink-0 touch-manipulation relative z-20",
          "min-h-11 min-w-11 p-2 rounded-sm",
          "hover:bg-muted/30 active:bg-muted/50",
          disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          className,
        )}
      >
        <CheckboxIndicator checked={!!checked} disabled={disabled} />
        <button
          ref={ref}
          type="button"
          tabIndex={disabled ? -1 : 0}
          disabled={disabled}
          aria-checked={!!checked}
          role="checkbox"
          aria-label={props["aria-label"]}
          title={props.title}
          className="absolute inset-0 z-10 cursor-pointer rounded-sm"
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              toggle(e);
            }
          }}
        />
      </div>
    );
  },
);
TouchCheckbox.displayName = "TouchCheckbox";

/** Checkbox + label text in one tappable row (use for step lists). */
export const TouchCheckboxField = React.forwardRef<
  HTMLDivElement,
  TouchCheckboxProps & { children: React.ReactNode; boxClassName?: string }
>(({ className, disabled, children, checked, onChange, boxClassName, ...props }, ref) => {
  const toggle = () => {
    if (disabled) return;
    emitChange(onChange, !checked);
  };

  return (
    <div
      ref={ref}
      role="checkbox"
      aria-checked={!!checked}
      aria-label={props["aria-label"]}
      title={props.title}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        e.stopPropagation();
        if (isInteractiveChild(e.target)) return;
        toggle();
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      className={cn(
        "flex items-start gap-3 w-full cursor-pointer touch-manipulation relative z-10",
        "min-h-11 py-2 px-1 rounded-sm hover:bg-muted/30 active:bg-muted/50",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed",
        className,
      )}
    >
      <CheckboxIndicator
        checked={!!checked}
        disabled={disabled}
        className="mt-0.5"
        boxClassName={boxClassName}
      />
      <span className="flex-1 min-w-0 pt-0.5">{children}</span>
    </div>
  );
});
TouchCheckboxField.displayName = "TouchCheckboxField";
