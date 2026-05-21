import { useApp } from "@/lib/app-store";
import { Link, useRouter } from "@tanstack/react-router";
import { SecurityBanner } from "./SecurityBanner";
import { CMSFooter } from "./CMSFooter";
import { YearToggle } from "./YearToggle";
import { LogOut, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditPill } from "./CreditPill";
import type { ReactNode } from "react";

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { user, setUser, log } = useApp();
  const router = useRouter();

  const logout = () => {
    log("LOGOUT");
    setUser(null);
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <header className="glass border-b border-border/60 px-6 py-3 flex items-center justify-between gap-4 flex-wrap sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="h-9 w-9 rounded-xl grad-indigo flex items-center justify-center shadow">
            <Bot className="h-5 w-5 text-white" />
          </span>
          Muntie<span className="text-emerald">'s</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <YearToggle />
          {user?.role === "advisor" && <CreditPill />}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <div className="text-right">
                <div className="font-medium">{user.full_name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user.role}{user.npn_number && ` · NPN ${user.npn_number}`}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={logout}><LogOut className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
