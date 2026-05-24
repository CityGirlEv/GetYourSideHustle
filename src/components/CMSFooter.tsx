import { Link } from "@tanstack/react-router";
import { Home, LogIn } from "lucide-react";

export function CMSFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-secondary/40 px-6 py-6 text-xs text-muted-foreground">
      <div className="max-w-4xl mx-auto space-y-3">
        <p className="leading-relaxed">
          <strong className="text-foreground">Notice:</strong> This tool compares sample Medicare plan scenarios for educational purposes only.
          It is not a complete listing of plans available in your area. For a complete listing, contact{" "}
          <a className="underline" href="https://www.medicare.gov">Medicare.gov</a> or 1-800-MEDICARE.
        </p>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <Link to="/auth" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <LogIn className="h-3.5 w-3.5" /> Agent login
          </Link>
        </div>
      </div>
    </footer>
  );
}
