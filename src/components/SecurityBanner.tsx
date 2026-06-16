import {
  Home,
  LogIn,
  LogOut,
  ChevronDown,
  FlaskConical,
  FileSignature,
  UserPlus,
  LayoutDashboard,
  Briefcase,
  FileText,
} from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { YearToggle } from "./YearToggle";
import { AdminNotificationsBell } from "./AdminNotificationsBell";
import { AdminNavDropdown } from "./AdminNavDropdown";
import { BrandLogo } from "./BrandLogo";
import { SITE_TAGLINE } from "@/lib/site-brand";
import { userHasAdminRole } from "@/lib/user-roles";
import { FontSizeToggle } from "./FontSizeToggle";
import { CreditPill } from "./CreditPill";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLink =
  "flex items-center gap-1.5 min-h-11 py-2 text-primary font-semibold underline-offset-4 transition-colors touch-manipulation hover:text-primary/65 hover:underline";

export function SecurityBanner() {
  const { user, authLoading, signOut } = useApp();
  const router = useRouter();
  const isAdmin = userHasAdminRole(user);

  const logout = async () => {
    await signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <nav
      aria-label="Site navigation"
      className="relative z-10 border-b-0 bg-transparent px-4 py-1 text-sm"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:gap-x-6">
          <div className="flex flex-col items-start justify-center gap-1 min-w-0 self-center">
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1">
              <Link to="/" className={navLink}>
                <Home className="h-4 w-4 shrink-0" /> Home
              </Link>
              <Link to="/pricing" className={navLink}>
                <Briefcase className="h-4 w-4 shrink-0" /> Pricing
              </Link>
              {!authLoading && isAdmin && (
                <>
                  <AdminNotificationsBell tone="light" />
                  <AdminNavDropdown variant="banner" />
                </>
              )}
            </div>
            {!user ? (
              <YearToggle tone="light" />
            ) : (
              <div className="max-w-[11rem] text-xs leading-tight">
                <div className="truncate font-medium text-foreground">{user.full_name}</div>
                <div className="truncate capitalize text-muted-foreground">
                  {user.role}
                  {user.npn_number && ` · NPN ${user.npn_number}`}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 self-center text-center">
            <Link
              to="/"
              aria-label="Get Part B Optimizer"
              className="block drop-shadow-[0_2px_4px_rgba(0,40,112,0.1)]"
            >
              <BrandLogo size="nav" />
            </Link>
            <p className="mt-1 max-w-[16rem] sm:max-w-[22rem] px-1 text-xs sm:text-sm font-display font-semibold italic leading-snug text-primary">
              {SITE_TAGLINE}
            </p>
          </div>

          <div className="flex flex-col items-end justify-center gap-1 min-w-0 self-center">
            <div className="flex flex-wrap items-center justify-end gap-x-3 sm:gap-x-4 gap-y-1">
              {user ? (
                <button onClick={logout} className={navLink}>
                  <LogOut className="h-4 w-4 shrink-0" /> Log out
                </button>
              ) : (
                <>
                  <Link to="/auth" search={{ tab: "sign-in" }} className={navLink}>
                    <LogIn className="h-4 w-4 shrink-0" /> Log in
                  </Link>
                  <Link to="/auth" search={{ tab: "register" }} className={navLink}>
                    <UserPlus className="h-4 w-4 shrink-0" /> Register
                  </Link>
                </>
              )}
            </div>
            {user && <YearToggle tone="light" />}
            <div className="flex flex-wrap items-center justify-end gap-x-3 sm:gap-x-4 gap-y-1">
              <FontSizeToggle />
              {(user?.role === "advisor" || user?.role === "qa") && <CreditPill />}
              {user?.role === "qa" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1 h-8">
                      <FlaskConical className="h-4 w-4" />
                      <span className="hidden sm:inline">QA</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to="/testing" className="flex items-center gap-2 cursor-pointer">
                        <FlaskConical className="h-4 w-4" /> Testing Portal
                      </Link>
                    </DropdownMenuItem>
                    {userHasAdminRole(user) && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin/email-templates"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="h-4 w-4" /> Email Templates
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/nda" className="flex items-center gap-2 cursor-pointer">
                        <FileSignature className="h-4 w-4" /> NDA
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {(user?.role === "agent" || user?.role === "customer") && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1 h-8">
                      <Briefcase className="h-4 w-4" />
                      <span className="hidden sm:inline">Agent</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to="/agent" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" /> Agent Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/agent" className="flex items-center gap-2 cursor-pointer">
                        <FileText className="h-4 w-4" /> My Scenarios
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/nda" className="flex items-center gap-2 cursor-pointer">
                        <FileSignature className="h-4 w-4" /> Agent NDA
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
