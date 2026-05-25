import { Home, LogIn, ListChecks, ChevronDown, FlaskConical, FileSignature, UserPlus } from "lucide-react";
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-x-4 flex-wrap">
          <div className="flex items-center gap-3 flex-shrink-0">
            <YearToggle />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-3 md:gap-x-4 gap-y-1 text-white/90 min-w-0">
            <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
            <Link to="/auth" className="flex items-center gap-1 hover:text-white transition-colors">
              <LogIn className="h-3.5 w-3.5" /> Log in
            </Link>
            <Link to="/register" className="flex items-center gap-1 hover:text-white transition-colors">
              <UserPlus className="h-3.5 w-3.5" /> Register
            </Link>

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
      </div>
    </div>
  );
}
