import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StaffSubNavProps = {
  active: "roster" | "report";
  className?: string;
};

export function StaffSubNav({ active, className }: StaffSubNavProps) {
  return (
    <nav className={cn("flex flex-wrap gap-2", className)} aria-label="Staff sections">
      <Button asChild size="sm" variant={active === "roster" ? "default" : "outline"}>
        <Link to="/staff">Staff roster</Link>
      </Button>
      <Button asChild size="sm" variant={active === "report" ? "default" : "outline"}>
        <Link to="/staff/report">Device report</Link>
      </Button>
    </nav>
  );
}
