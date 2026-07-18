import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { scrollToBenchmarkReportTop } from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";

const SCROLL_SHOW_THRESHOLD_PX = 320;

/** Mobile-only — returns to the sticky report header (tabs + filters). */
export function BenchmarkReportBackToTop({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_SHOW_THRESHOLD_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  const scrollToTop = () => {
    scrollToBenchmarkReportTop();
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={cn(
        "md:hidden fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-primary/40",
        "bg-background/95 px-3 py-2 text-xs font-semibold text-primary shadow-lg backdrop-blur",
        "hover:bg-primary/5 active:scale-[0.98] transition-transform",
        className,
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
      Up
    </button>
  );
}
