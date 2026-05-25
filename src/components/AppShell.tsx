import { useApp } from "@/lib/app-store";
import { Link, useRouter } from "@tanstack/react-router";
import { SecurityBanner } from "./SecurityBanner";
import { CMSFooter } from "./CMSFooter";
import { YearToggle } from "./YearToggle";
import { LogOut, Settings, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditPill } from "./CreditPill";
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
            <img src={muntieLogo} alt="Medicare Optimizer" className="h-9 w-9 sm:h-12 sm:w-12 md:h-20 md:w-20 object-contain flex-shrink-0" />
            <span className="hidden lg:inline font-display font-bold text-primary uppercase text-base xl:text-lg truncate">Medicare Optimizer</span>
          </Link>
          <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            {user?.role === "admin" && (
              <>
                <Link to="/admin" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Settings className="h-3.5 w-3.5" /> Admin
                </Link>
                <Link to="/users" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Users className="h-3.5 w-3.5" /> Users
                </Link>
              </>
            )}
            {user?.role === "agent" && (
              <Link to="/agent" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Briefcase className="h-3.5 w-3.5" /> My assignments
              </Link>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center min-w-0 px-2 overflow-hidden">
          <h1 className="text-sm sm:text-base md:text-2xl lg:text-3xl font-display font-bold text-primary uppercase truncate">{title}</h1>
          {subtitle && <p className="hidden xl:block font-display text-sm font-bold text-blue-600 tracking-wide truncate max-w-full">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 flex-none shrink-0">
          <YearToggle />
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
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
