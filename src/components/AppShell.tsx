import { useApp } from "@/lib/app-store";
import { Link, useRouter } from "@tanstack/react-router";
import { SecurityBanner } from "./SecurityBanner";
import { CMSFooter } from "./CMSFooter";
import { LogOut, FlaskConical, ChevronDown, LayoutDashboard, ListChecks, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditPill } from "./CreditPill";
import { FontSizeToggle } from "./FontSizeToggle";
import { type ReactNode } from "react";
import muntieLogo from "@/assets/muntie-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <header className="glass border-b border-border/60 px-3 md:px-6 py-2 md:py-3 flex items-center sticky top-0 z-30 gap-2 md:gap-4 relative">
        <div className="flex items-center gap-2 min-w-0 shrink z-10">
          <Link to="/" className="flex items-center gap-2 md:gap-3 font-display font-bold">
            <img src={muntieLogo} alt="The Medicare Optimizer" className="h-9 w-9 sm:h-12 sm:w-12 md:h-20 md:w-20 object-contain flex-shrink-0" />
          </Link>
        </div>
        <div className="hidden lg:flex pointer-events-none absolute inset-0 flex-col items-center justify-center px-2">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-primary uppercase text-center">The Medicare Optimizer</h1>
          <p className="text-xs sm:text-sm md:text-base text-primary/80 font-medium italic text-center whitespace-nowrap">You Deserve The Best Medicare Plan Because You Earned It!</p>
        </div>
        <div className="flex lg:hidden flex-1 flex-col items-center justify-center min-w-0 px-2 overflow-hidden">
          <h1 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-primary uppercase truncate text-center">The Medicare Optimizer</h1>
          <p className="text-xs sm:text-sm text-primary/80 font-medium italic text-center truncate max-w-full">You Deserve The Best Medicare Plan Because You Earned It!</p>
        </div>
        <div className="flex items-center gap-3 flex-none shrink-0 ml-auto z-10">
          <FontSizeToggle />
          {user?.role === "advisor" && <CreditPill />}
          {(user?.role === "admin" || user?.role === "qa") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <FlaskConical className="h-4 w-4" />
                  <span className="hidden sm:inline">QA</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/qa" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />QA Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/testing" className="flex items-center gap-2 cursor-pointer">
                    <FlaskConical className="h-4 w-4" />Testing Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tasks" className="flex items-center gap-2 cursor-pointer">
                    <ListChecks className="h-4 w-4" />Task Sheet
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user?.role === "agent" && (
            <Button size="sm" variant="outline" className="gap-1" asChild>
              <Link to="/agent">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Agent</span>
              </Link>
            </Button>
          )}
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
