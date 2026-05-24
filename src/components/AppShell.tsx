import { useApp } from "@/lib/app-store";
import { Link, useRouter } from "@tanstack/react-router";
import { SecurityBanner } from "./SecurityBanner";
import { CMSFooter } from "./CMSFooter";
import { YearToggle } from "./YearToggle";
import { LogOut } from "lucide-react";
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
      <header className="glass border-b border-border/60 px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg shrink-0">
          <img src={muntieLogo} alt="Medicare Optimizer" className="h-16 w-16 object-contain" />
        </Link>
        <div className="flex-1 text-center min-w-0 px-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-emerald leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[11px] md:text-xs italic text-emerald font-semibold truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <YearToggle />
          {user?.role === "advisor" && <CreditPill />}
          {user && (
            <div className="flex items-center gap-2 text-sm">
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
