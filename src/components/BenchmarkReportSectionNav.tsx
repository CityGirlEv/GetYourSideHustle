import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BENCHMARK_REPORT_LINK_CLASS, BENCHMARK_REPORT_TAB_TRIGGER_CLASS } from "@/lib/benchmark-report-ui";

import type { ChecklistProgressCount } from "@/lib/submission-checklist-data";

export type BenchmarkReportNavSection = {
  id: string;
  label: string;
  number: number;
  /** Optional secondary text — e.g. monthly price on agent tier tabs. */
  meta?: string;
  /** Optional complete/total counts shown as `done/total` after the label. */
  progress?: ChecklistProgressCount;
};

export type BenchmarkReportToolbarAction = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: "plus";
  variant?: "default" | "save";
  disabled?: boolean;
  /** Native tooltip — wrapped for disabled pills so hover still works. */
  title?: string;
};

export type BenchmarkReportToolbarLinkAction = {
  id: string;
  label: string;
  to: string;
  icon?: "plus";
};

const actionPillClass =
  "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-primary/40 bg-background px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 whitespace-nowrap";

const saveActionPillClass =
  "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-emerald bg-emerald px-2.5 py-0.5 text-xs font-semibold text-emerald-foreground shadow-sm transition-colors hover:bg-emerald/90 whitespace-nowrap";

const tabTriggerClass = BENCHMARK_REPORT_TAB_TRIGGER_CLASS;

const disabledActionPillClass = "pointer-events-none cursor-not-allowed opacity-45";

function ToolbarActionPill({
  label,
  icon,
  onClick,
  variant = "default",
  disabled = false,
  title,
}: {
  label: string;
  icon?: "plus";
  onClick: () => void;
  variant?: "default" | "save";
  disabled?: boolean;
  title?: string;
}) {
  const pill = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? undefined : title}
      className={cn(
        variant === "save" ? saveActionPillClass : actionPillClass,
        variant !== "save" && BENCHMARK_REPORT_LINK_CLASS,
        disabled && disabledActionPillClass,
      )}
    >
      {icon === "plus" ? <Plus className="h-3 w-3 shrink-0" aria-hidden /> : null}
      {label}
    </button>
  );

  if (disabled && title) {
    return (
      <span className="inline-flex" title={title}>
        {pill}
      </span>
    );
  }

  return pill;
}

function ToolbarActionLinkPill({
  label,
  to,
  icon,
}: {
  label: string;
  to: string;
  icon?: "plus";
}) {
  return (
    <Link to={to} className={cn(actionPillClass, BENCHMARK_REPORT_LINK_CLASS)}>
      {icon === "plus" ? <Plus className="h-3 w-3 shrink-0" aria-hidden /> : null}
      {label}
    </Link>
  );
}

/** Copy link, Download PDF, and More — rendered beside the report ID. */
export function BenchmarkReportToolbar({
  actions = [],
  linkActions = [],
  submenuActions = [],
  className,
}: {
  actions?: BenchmarkReportToolbarAction[];
  linkActions?: BenchmarkReportToolbarLinkAction[];
  submenuActions?: BenchmarkReportToolbarAction[];
  className?: string;
}) {
  if (actions.length === 0 && linkActions.length === 0 && submenuActions.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Report actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {actions.map((action) => (
        <ToolbarActionPill
          key={action.id}
          label={action.label}
          icon={action.icon}
          variant={action.variant}
          disabled={action.disabled}
          title={action.title}
          onClick={action.onClick}
        />
      ))}
      {linkActions.map((action) => (
        <ToolbarActionLinkPill
          key={action.id}
          label={action.label}
          to={action.to}
          icon={action.icon}
        />
      ))}
      {submenuActions.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(actionPillClass, BENCHMARK_REPORT_LINK_CLASS, "items-center")}
            >
              More
              <ChevronDown className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[11rem]">
            {submenuActions.map((action) => (
              <DropdownMenuItem key={action.id} onClick={action.onClick}>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  );
}

/**
 * Section tabs across the top of the benchmark report.
 * Render inside a parent `<Tabs>`.
 */
export function BenchmarkReportTabBar({
  sections,
  trailing,
  className,
}: {
  sections: BenchmarkReportNavSection[];
  /** Report ID, copy link, Open PDF — aligned to the right on md+. */
  trailing?: ReactNode;
  /** @deprecated Tabs are controlled by the parent `<Tabs>`; unused. */
  activeId?: string;
  /** @deprecated Tabs are controlled by the parent `<Tabs>`; unused. */
  onNavigate?: (id: string) => void;
  /** @deprecated Pass actions via `trailing` instead. */
  actions?: BenchmarkReportToolbarAction[];
  /** @deprecated Pass submenuActions via `trailing` instead. */
  submenuActions?: BenchmarkReportToolbarAction[];
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border", className)}>
      <div
        className={cn(
          "flex items-end gap-3",
          trailing ? "flex-col md:flex-row md:justify-between" : "min-w-0",
        )}
      >
        <TabsList
          className={cn(
            "flex h-auto min-w-0 flex-1 items-end gap-0 rounded-none bg-transparent p-0",
            "flex-nowrap overflow-x-auto justify-start [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            !trailing && "w-full",
          )}
        >
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className={cn(tabTriggerClass, "shrink-0")}
            >
              <span className="inline-flex flex-col items-center leading-tight sm:flex-row sm:items-baseline">
                <span>{section.label}</span>
                {section.meta ? (
                  <>
                    <span className="mx-0 hidden opacity-80 sm:mx-1 sm:inline" aria-hidden>
                      ·
                    </span>
                    <span className="text-[10px] font-normal tabular-nums opacity-90 sm:text-[11px]">
                      {section.meta}
                    </span>
                  </>
                ) : null}
              </span>
              {section.progress && section.progress.total > 0 ? (
                <span
                  className="ml-1 tabular-nums opacity-90"
                  aria-hidden
                  title={`${section.progress.done} of ${section.progress.total} complete`}
                >
                  {section.progress.done}/{section.progress.total}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        {trailing ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2 gap-y-1.5 pb-1 md:pb-2 md:pl-2">
            {trailing}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use BenchmarkReportTabBar */
export function BenchmarkReportTabList({
  sections,
  className,
}: {
  sections: BenchmarkReportNavSection[];
  className?: string;
}) {
  return <BenchmarkReportTabBar sections={sections} className={className} />;
}

/** @deprecated Section navigation is on BenchmarkReportTabBar tabs only. */
export function BenchmarkReportBubbleBar(props: {
  sections: BenchmarkReportNavSection[];
  activeId?: string;
  onNavigate: (id: string) => void;
  actions?: BenchmarkReportToolbarAction[];
  submenuActions?: BenchmarkReportToolbarAction[];
  className?: string;
}) {
  return <BenchmarkReportTabBar sections={props.sections} className={props.className} />;
}

/** @deprecated Use BenchmarkReportTabBar */
export function BenchmarkReportSectionNav(props: {
  sections: BenchmarkReportNavSection[];
  activeId?: string;
  onNavigate: (id: string) => void;
  className?: string;
}) {
  return <BenchmarkReportTabBar sections={props.sections} className={props.className} />;
}

/** @deprecated Use BenchmarkReportTabBar */
export function BenchmarkReportSectionNavMobile(props: {
  sections: BenchmarkReportNavSection[];
  activeId?: string;
  onNavigate: (id: string) => void;
  className?: string;
}) {
  return <BenchmarkReportTabBar sections={props.sections} className={props.className} />;
}
