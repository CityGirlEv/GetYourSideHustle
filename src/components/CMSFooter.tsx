import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LogIn, Link2, BookOpen, Sparkles } from "lucide-react";
import { MedicareDisclaimers } from "@/components/MedicareDisclaimers";
import { BrandLogo } from "@/components/BrandLogo";
import { NewsletterSignupForm } from "@/components/NewsletterSignupForm";
import { formatSiteCopyright } from "@/lib/medicare-disclaimers";

export function CMSFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNewsletterSignup = pathname === "/subscribe";

  return (
    <footer className="mt-4 border-t border-border bg-secondary/40 px-6 py-4 text-sm text-muted-foreground">
      <div className="max-w-4xl mx-auto space-y-3 text-left">
        <MedicareDisclaimers />
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center justify-center p-0.5 hover:opacity-90 transition-opacity"
          >
            <BrandLogo size="footer" />
          </Link>
          <p className="text-xs text-muted-foreground/80">{formatSiteCopyright()}</p>
        </div>
        {!hideNewsletterSignup ? (
          <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Weekly Medicare education</p>
            <NewsletterSignupForm compact />
          </div>
        ) : null}
        <div className="flex items-center gap-x-4 gap-y-2 text-foreground flex-wrap pt-1">
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
            to="/features"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" /> Features
          </Link>
          <Link
            to="/learning-center"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" /> Learning Center
          </Link>
          <Link
            to="/sources"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" /> Data sources
          </Link>
          <Link
            to="/about"
            className="hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link to="/sitemap" className="hover:text-foreground transition-colors">
            Site map
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
