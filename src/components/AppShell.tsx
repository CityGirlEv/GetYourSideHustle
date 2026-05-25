import { useApp } from "@/lib/app-store";
import { Link, useRouter } from "@tanstack/react-router";
import { SecurityBanner } from "./SecurityBanner";
import { CMSFooter } from "./CMSFooter";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditPill } from "./CreditPill";
import { FontSizeToggle } from "./FontSizeToggle";
import type { ReactNode } from "react";
import muntieLogo from "@/assets/muntie-logo.png";

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { user, signOut } = useApp();
  const router = useRouter();

  const logout = async () => {
    await signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <header className="glass border-b border-border/60 px-3 md:px-6 py-2 md:py-3 flex items-center sticky top-0 z-30 gap-2 md:gap-4">
        <div className="flex items-center gap-2 min-w-0 shrink">
          <Link to="/" className="flex items-center gap-2 md:gap-3 font-display font-bold">
            <img src={muntieLogo} alt="The Medicare Optimizer" className="h-9 w-9 sm:h-12 sm:w-12 md:h-20 md:w-20 object-contain flex-shrink-0" />
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center min-w-0 px-2 overflow-hidden">
          <h1 className="text-sm sm:text-base md:text-2xl lg:text-3xl font-display font-bold text-primary uppercase truncate">The Medicare Optimizer</h1>
          <p className="hidden xl:block font-display text-sm font-bold text-blue-600 tracking-wide truncate max-w-full">Getting the Best Bang For Your Medical Needs Because You Deserve It!</p>
        </div>
        <div className="flex items-center gap-3 flex-none shrink-0">
          <FontSizeToggle />
          {user?.role === "advisor" && <CreditPill />}
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="text-right">
                <div className="font-medium">{user.full_name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}{user.npn_number && ` · NPN ${user.npn_number}`}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={logout} title="Sign out"><LogOut className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl w-full mx-auto">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className="font-display font-bold text-2xl md:text-3xl text-primary">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
