import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type TouchCheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof Checkbox>,
  "onCheckedChange" | "checked"
> & {
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

function emitChange(onChange: TouchCheckboxProps["onChange"], checked: boolean) {
  onChange?.({ target: { checked } } as React.ChangeEvent<HTMLInputElement>);
}

/** Checkbox with a 44px touch target (tablet-friendly). */
export const TouchCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  TouchCheckboxProps
>(({ className, disabled, checked, onChange, ...props }, ref) => {
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
      <Checkbox
        ref={ref}
        checked={!!checked}
        disabled={disabled}
        className="h-6 w-6 pointer-events-none"
        tabIndex={-1}
        aria-hidden
        {...props}
      />
      <button
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
});
TouchCheckbox.displayName = "TouchCheckbox";

/** Checkbox + label text in one tappable row (use for step lists). */
export const TouchCheckboxField = React.forwardRef<
  HTMLDivElement,
  TouchCheckboxProps & { children: React.ReactNode }
>(({ className, disabled, children, checked, onChange, ...props }, ref) => {
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
      <Checkbox
        checked={!!checked}
        disabled={disabled}
        className="mt-0.5 h-6 w-6 shrink-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden
      />
      <span className="flex-1 min-w-0 pt-0.5 select-none">{children}</span>
    </div>
  );
});
TouchCheckboxField.displayName = "TouchCheckboxField";
