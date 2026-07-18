import { ChevronUp } from "lucide-react";
import {
  BENCHMARK_REPORT_LINK_CLASS,
  scrollToBenchmarkReportTop,
} from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";

/** Inline link at the bottom of a report tab — scrolls to sticky tabs/filters. */
export function BenchmarkReportBackToTopLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollToBenchmarkReportTop()}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80",
        BENCHMARK_REPORT_LINK_CLASS,
        className,
      )}
    >
      <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Back to top
    </button>
  );
}
