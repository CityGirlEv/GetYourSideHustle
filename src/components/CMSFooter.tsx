import { Link } from "@tanstack/react-router";
import { Home, LogIn, Link2 } from "lucide-react";
import { MedicareDisclaimers } from "@/components/MedicareDisclaimers";
import { formatSiteCopyright } from "@/lib/medicare-disclaimers";

export function CMSFooter() {
  return (
    <footer className="mt-4 border-t border-border bg-secondary/40 px-6 py-4 text-xs text-muted-foreground">
      <div className="max-w-4xl mx-auto space-y-3 text-left">
        <MedicareDisclaimers />
        <p className="text-[11px] text-muted-foreground/80">{formatSiteCopyright()}</p>
        <div className="flex items-center gap-x-4 gap-y-2 text-muted-foreground flex-wrap pt-1">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <Link
            to="/auth"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" /> Agent login
          </Link>
          <Link
            to="/sources"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" /> Data sources
          </Link>
          <Link
            to="/legal"
            hash="privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link to="/legal" hash="terms" className="hover:text-foreground transition-colors">
            Terms of Use
          </Link>
          <Link to="/legal" hash="cookies" className="hover:text-foreground transition-colors">
            Cookie Policy
          </Link>
          <Link
            to="/legal"
            hash="delete-data"
            className="hover:text-foreground transition-colors"
          >
            Delete My Data
          </Link>
          <Link
            to="/legal"
            hash="privacy-contact"
            className="hover:text-foreground transition-colors"
          >
            Contact Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
