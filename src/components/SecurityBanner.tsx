import { ShieldCheck, EyeOff, KeyRound, Home, LogIn, ListChecks, ChevronDown, FlaskConical, FileSignature, Users, Briefcase, Settings } from "lucide-react";
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
  const { user, authLoading } = useApp();
  const router = useRouter();
  const isQA = user?.role === "qa";

  return (
    <div className="grad-indigo px-4 py-2 text-xs font-medium">
      <div className="max-w-7xl mx-auto space-y-1">
        <div className="flex items-center justify-between gap-x-4 flex-wrap">
          <div className="flex items-center gap-3 flex-shrink-0">
            <YearToggle />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-3 md:gap-x-4 gap-y-1 text-white/90 min-w-0">
            <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-white transition-colors outline-none">
                <Users className="h-3.5 w-3.5" /> Team <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem onSelect={() => router.navigate({ to: "/auth" })}>
                  <LogIn className="h-3.5 w-3.5 mr-2" /> Team Login
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.navigate({ to: "/agent" })}>
                  <Briefcase className="h-3.5 w-3.5 mr-2" /> Agent Portal
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.navigate({ to: "/admin" })}>
                  <Settings className="h-3.5 w-3.5 mr-2" /> Admin Portal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.navigate({ to: "/testing" })}>
                  <FlaskConical className="h-3.5 w-3.5 mr-2" /> QA Testing Portal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!authLoading && isQA && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-white transition-colors outline-none">
                  <FlaskConical className="h-3.5 w-3.5" /> QA <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem onSelect={() => router.navigate({ to: "/testing" })}>
                  <ListChecks className="h-3.5 w-3.5 mr-2" /> Test Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.navigate({ to: "/nda" })}>
                  <FileSignature className="h-3.5 w-3.5 mr-2" /> Sign / View NDA
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white/95">
          <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-emerald" /> No personal information collected</span>
          <span className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-emerald" /> De-identified scenarios only</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald" /> Your scenario is anonymous unless you opt in</span>
        </div>
      </div>
    </div>
  );
}
