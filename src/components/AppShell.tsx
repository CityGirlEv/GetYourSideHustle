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
          <img src={muntieLogo} alt="Muntie's AI Agents" className="h-14 w-14 object-contain" />
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
        <div className="relative mb-6 bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <div className="relative">
              <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-3 italic font-serif tracking-wider text-blue-600 text-[10px] md:text-xs whitespace-nowrap">
                Built By
              </span>
              <img src={muntieLogo} alt="Medicare Optimizer" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <div className="text-center px-28">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald leading-tight">The Medicare Optimizer</h1>
            <p className="text-xs md:text-sm italic text-emerald font-semibold mt-1">Getting the Best Bang For Your Medical Needs Because You Deserve It!</p>
          </div>
        </div>
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
