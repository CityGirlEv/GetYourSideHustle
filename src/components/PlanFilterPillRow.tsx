import { cn } from "@/lib/utils";

/** Grid row for uniform-width filter pills — fixed columns align pills vertically. */
export function PlanFilterPillRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-filter-pill-row=""
      className={cn(
        "grid min-w-0 flex-1 items-center gap-0.5",
        "grid-cols-[repeat(auto-fill,minmax(6.25rem,6.25rem))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
