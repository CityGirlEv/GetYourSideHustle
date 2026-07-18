import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PlanFilterPill } from "@/components/PlanFilterPill";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Mobile-only hamburger trigger + bottom sheet for plan filter bubbles. */
export function PlanFilterMobileSheet({
  open,
  onOpenChange,
  title = "Filter plans",
  activeFilterLabel,
  activeFilterCount,
  hideActiveFilterCount,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  activeFilterLabel?: string;
  activeFilterCount?: number;
  hideActiveFilterCount?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className={cn("flex min-w-0 items-center gap-2 md:hidden", className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 shrink-0 gap-1.5 border-[var(--brand-navy-light)] bg-[var(--brand-navy-light)]",
            "text-xs font-semibold text-white hover:bg-[var(--brand-navy-accent)] hover:text-white",
          )}
          aria-label="Open plan filters"
          aria-expanded={open}
          onClick={() => onOpenChange(true)}
        >
          <Menu className="h-4 w-4 shrink-0" aria-hidden />
          Filters
        </Button>
        {activeFilterLabel ? (
          <PlanFilterPill
            label={activeFilterLabel}
            count={activeFilterCount}
            hideCount={hideActiveFilterCount}
            active
            onClick={() => onOpenChange(true)}
            uniformSize
          />
        ) : null}
      </div>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[min(85vh,640px)] overflow-y-auto rounded-t-xl px-3 pb-6 pt-2 sm:px-4"
        >
          <SheetHeader className="pb-3 text-left">
            <SheetTitle className="font-display text-base text-[var(--brand-navy)]">
              {title}
            </SheetTitle>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
}
