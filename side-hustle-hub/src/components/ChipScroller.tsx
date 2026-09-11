import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chipScrollerOverflow, chipScrollerStep } from "../lib/chip-scroller";

type ChipScrollerProps = {
  children: ReactNode;
  trackClassName: string;
  ariaLabel: string;
  testId?: string;
  role?: "tablist" | "group";
};

export function ChipScroller({
  children,
  trackClassName,
  ariaLabel,
  testId,
  role = "tablist",
}: ChipScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [overflow, setOverflow] = useState(false);

  const measure = () => {
    const el = trackRef.current;
    if (!el) return;
    const next = chipScrollerOverflow({
      scrollLeft: el.scrollLeft,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    });
    setOverflow(next.overflow);
    setCanLeft(next.canLeft);
    setCanRight(next.canRight);
  };

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  const nudge = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * chipScrollerStep(el.clientWidth), behavior: "smooth" });
  };

  return (
    <div
      className={`chip-scroller${overflow ? " chip-scroller--overflow" : ""}`}
      data-testid={testId}
    >
      <button
        type="button"
        className="chip-scroller__arrow chip-scroller__arrow--left"
        aria-label="Show previous"
        data-testid={testId ? `${testId}-prev` : undefined}
        disabled={!canLeft}
        onClick={() => nudge(-1)}
      >
        <ChevronLeft size={20} aria-hidden />
      </button>
      <div
        ref={trackRef}
        className={`${trackClassName} chip-scroller__track`}
        role={role}
        aria-label={ariaLabel}
      >
        {children}
      </div>
      <button
        type="button"
        className="chip-scroller__arrow chip-scroller__arrow--right"
        aria-label="Show more"
        data-testid={testId ? `${testId}-next` : undefined}
        disabled={!canRight}
        onClick={() => nudge(1)}
      >
        <ChevronRight size={20} aria-hidden />
      </button>
    </div>
  );
}
