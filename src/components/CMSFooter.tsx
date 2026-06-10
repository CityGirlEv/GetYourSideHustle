import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LogIn, Link2 } from "lucide-react";
import { MedicareDisclaimers } from "@/components/MedicareDisclaimers";
import { formatSiteCopyright } from "@/lib/medicare-disclaimers";

export function CMSFooter() {
  const isHome = useRouterState({ select: (s) => s.location.pathname === "/" });

  return (
    <footer className="mt-12 border-t border-border bg-secondary/40 px-6 py-6 text-xs text-muted-foreground">
      <div className="max-w-4xl mx-auto space-y-4 text-left">
        {!isHome && <MedicareDisclaimers />}
        <p className="text-[11px] text-muted-foreground/80">{formatSiteCopyright()}</p>
        <div className="flex items-center gap-4 text-muted-foreground flex-wrap pt-1">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <Link to="/auth" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <LogIn className="h-3.5 w-3.5" /> Agent login
          </Link>
          <Link to="/sources" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Link2 className="h-3.5 w-3.5" /> Data sources
          </Link>
        </div>
      </div>
    </footer>
  );
}
