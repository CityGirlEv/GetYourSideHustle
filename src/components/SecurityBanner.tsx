import { ShieldCheck, EyeOff, KeyRound, Home, LogIn, Settings, Briefcase, ListChecks, ChevronDown, GitBranch, CalendarDays, DollarSign, LogOut } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { YearToggle } from "./YearToggle";
import { useApp } from "@/lib/app-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SecurityBanner() {
  const { user, signOut } = useApp();
  const router = useRouter();
  const isAgentLike = user?.role === "agent" || user?.role === "qa";
  const isAdmin = user?.role === "admin";

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="grad-indigo px-4 py-2 text-xs font-medium">
      <div className="max-w-7xl mx-auto space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <YearToggle />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-white/90">
            <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>

            {/* Agent menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-white transition-colors outline-none">
                <Briefcase className="h-3.5 w-3.5" /> Agent <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                {!isAgentLike && (
                  <DropdownMenuItem onSelect={() => router.navigate({ to: "/auth" })}>
                    <LogIn className="h-3.5 w-3.5 mr-2" /> Agent login
                  </DropdownMenuItem>
                )}
                {isAgentLike && (
                  <>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Signed in · {user?.role}
                    </DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => router.navigate({ to: "/agent" })}>
                      <Briefcase className="h-3.5 w-3.5 mr-2" /> My assignments
                    </DropdownMenuItem>
                    {user?.role === "qa" && (
                      <DropdownMenuItem onSelect={() => router.navigate({ to: "/qa" })}>
                        <ListChecks className="h-3.5 w-3.5 mr-2" /> QA
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleSignOut}>
                      <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-white transition-colors outline-none">
                <Settings className="h-3.5 w-3.5" /> Admin <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                {!isAdmin && (
                  <DropdownMenuItem onSelect={() => router.navigate({ to: "/auth" })}>
                    <LogIn className="h-3.5 w-3.5 mr-2" /> Admin login
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Admin tools
                    </DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => router.navigate({ to: "/admin", search: {} })}>
                      <Settings className="h-3.5 w-3.5 mr-2" /> Admin home
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.navigate({ to: "/admin", search: { tab: "rollout" } })}>
                      <CalendarDays className="h-3.5 w-3.5 mr-2" /> Rollout Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.navigate({ to: "/admin", search: { tab: "impl" } })}>
                      <GitBranch className="h-3.5 w-3.5 mr-2" /> IP (Implementation Plan)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.navigate({ to: "/admin", search: { tab: "budget" } })}>
                      <DollarSign className="h-3.5 w-3.5 mr-2" /> Budget
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleSignOut}>
                      <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white/95">
          <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-emerald" /> No personal information collected</span>
          <span className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-emerald" /> De-identified scenarios only</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald" /> Your scenario is anonymous unless opted in</span>
        </div>
      </div>
    </div>
  );
}
