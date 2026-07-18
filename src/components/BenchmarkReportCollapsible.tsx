import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { BENCHMARK_REPORT_LINK_CLASS, BENCHMARK_SECTION_HEADING_CLASS } from "@/lib/benchmark-report-ui";

export function BenchmarkReportSubsection({
  id,
  title,
  subtitle,
  compact = false,
  active = false,
  titleClassName,
  className,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
  active?: boolean;
  titleClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        "scroll-mt-24 rounded-lg border bg-background/60 transition-colors",
        active
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/25"
          : "border-border",
        className,
      )}
    >
      <div
        className={cn(
          "border-b border-border/60",
          compact ? "px-3 py-1.5" : "px-4 py-2",
        )}
      >
        <div
          className={cn(
            "font-semibold leading-snug",
            BENCHMARK_SECTION_HEADING_CLASS,
            compact ? "text-xs" : "text-sm",
            titleClassName,
          )}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            className={cn(
              "text-muted-foreground leading-snug",
              compact ? "text-micro mt-0" : "text-xs mt-0.5",
            )}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          compact ? "px-3 pt-1.5 pb-2 space-y-1" : "px-4 pt-2 pb-3 space-y-2",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function BenchmarkReportCollapsible({
  id,
  title,
  subtitle,
  defaultOpen = false,
  open,
  onOpenChange,
  compact = false,
  prominentExpandIcon = false,
  expandIconPosition = "right",
  className,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  compact?: boolean;
  /** Larger primary chevron — for collapsed-by-default sections like #1 vs #2. */
  prominentExpandIcon?: boolean;
  /** Chevron before or after the title (default trailing). */
  expandIconPosition?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const controlled = open !== undefined;
  const iconOnLeft = expandIconPosition === "left";

  const chevron = (
    <ChevronRight
      aria-hidden
      className={cn(
        "shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-90",
        prominentExpandIcon
          ? compact
            ? "h-4 w-4"
            : "h-5 w-5"
          : compact
            ? "h-3.5 w-3.5"
            : "h-4 w-4",
      )}
    />
  );

  return (
    <div id={id} className={cn("scroll-mt-24", id ? undefined : "contents")}>
      <Collapsible
        defaultOpen={controlled ? undefined : defaultOpen}
        open={controlled ? open : undefined}
        onOpenChange={onOpenChange}
        className={cn(
          "group rounded-lg border border-border bg-background/60 transition-colors",
          "data-[state=open]:border-primary/50 data-[state=open]:bg-primary/5 data-[state=open]:ring-1 data-[state=open]:ring-primary/25",
          className,
        )}
      >
      <CollapsibleTrigger
        className={cn(
          "flex w-full cursor-pointer items-center text-left transition-colors",
          compact ? "gap-2 px-3 py-1.5" : "gap-3 px-4 py-3",
          "rounded-lg hover:bg-muted/30 data-[state=open]:rounded-b-none data-[state=open]:border-b data-[state=open]:border-border/60",
          "data-[state=open]:bg-primary/10 data-[state=open]:text-primary",
        )}
      >
        {iconOnLeft ? chevron : null}
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "min-w-0 truncate font-semibold leading-snug group-data-[state=closed]:underline",
              compact ? "text-xs" : "text-sm",
              BENCHMARK_REPORT_LINK_CLASS,
            )}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              className={cn(
                "truncate text-muted-foreground leading-snug",
                compact ? "text-micro mt-0" : "text-xs mt-0.5",
                iconOnLeft && (prominentExpandIcon ? "pl-5 sm:pl-5" : "pl-[1.375rem]"),
              )}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {!iconOnLeft ? chevron : null}
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          compact ? "px-3 pt-1.5 pb-2 space-y-2" : "px-4 pt-2 pb-3 space-y-3",
        )}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
    </div>
  );
}
