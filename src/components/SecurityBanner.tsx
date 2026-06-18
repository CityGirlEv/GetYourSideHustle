import {
  LogIn,
  LogOut,
  ChevronDown,
  FlaskConical,
  FileSignature,
  UserPlus,
  LayoutDashboard,
  Briefcase,
  FileText,
  BookOpen,
  Home,
} from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { YearToggle } from "./YearToggle";
import { AdminNotificationsBell } from "./AdminNotificationsBell";
import { AdminNavDropdown } from "./AdminNavDropdown";
import { BrandLogo } from "./BrandLogo";
import { SiteMobileNav } from "./SiteMobileNav";
import { userHasAdminRole } from "@/lib/user-roles";
import { FontSizeToggle } from "./FontSizeToggle";
import { CreditPill } from "./CreditPill";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navLink =
  "flex items-center gap-1.5 min-h-11 py-2 text-primary font-semibold underline-offset-4 transition-colors touch-manipulation hover:text-primary/65 hover:underline";

function PrimaryNavLinks() {
  const { user, authLoading } = useApp();
  const showPricing = !authLoading && userHasAdminRole(user);

  return (
    <>
      <Link to="/" className={navLink}>
        <Home className="h-4 w-4 shrink-0" /> Home
      </Link>
      {showPricing ? (
        <Link to="/pricing" className={navLink}>
          <Briefcase className="h-4 w-4 shrink-0" /> Pricing
        </Link>
      ) : null}
      <Link to="/learning-center" className={navLink}>
        <BookOpen className="h-4 w-4 shrink-0" /> Learning Center
      </Link>
    </>
  );
}

function AuthLinks({ onLogout }: { onLogout: () => void }) {
  const { user } = useApp();

  if (user) {
    return (
      <button onClick={onLogout} className={navLink}>
        <LogOut className="h-4 w-4 shrink-0" /> Log out
      </button>
    );
  }

  return (
    <>
      <Link to="/auth" search={{ tab: "sign-in" }} className={navLink}>
        <LogIn className="h-4 w-4 shrink-0" /> Log in
      </Link>
      <Link to="/auth" search={{ tab: "register" }} className={navLink}>
        <UserPlus className="h-4 w-4 shrink-0" /> Register
      </Link>
    </>
  );
}

function UserSummary({ className }: { className?: string }) {
  const { user } = useApp();
  if (!user) return null;

  return (
    <div className={cn("min-w-0 text-xs leading-tight", className)}>
      <div className="truncate font-medium text-foreground">{user.full_name}</div>
      <div className="truncate capitalize text-muted-foreground">
        {user.role}
        {user.npn_number && ` · NPN ${user.npn_number}`}
      </div>
    </div>
  );
}

function RoleMenus() {
  const { user } = useApp();

  return (
    <>
      {user?.role === "qa" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1 h-8">
              <FlaskConical className="h-4 w-4" />
              QA
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
              Agent
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
      <FontSizeToggle />
      {(user?.role === "advisor" || user?.role === "qa") && <CreditPill />}
    </>
  );
}

function AdminTools() {
  const { user, authLoading } = useApp();
  const isAdmin = userHasAdminRole(user);

  if (authLoading || !isAdmin) return null;

  return (
    <>
      <AdminNotificationsBell tone="light" />
      <AdminNavDropdown variant="banner" />
    </>
  );
}

export function SecurityBanner() {
  const { user, signOut } = useApp();
  const router = useRouter();

  const logout = async () => {
    await signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <nav
      aria-label="Site navigation"
      className="relative z-10 border-b-0 bg-transparent px-3 sm:px-4 py-1 text-sm"
    >
      <div className="max-w-7xl mx-auto">
        <SiteMobileNav onLogout={logout} />

        <div className="hidden lg:flex items-center justify-between gap-x-6 gap-y-2 py-0.5">
          <Link
            to="/"
            aria-label="Get Part B Optimizer"
            className="block shrink-0 drop-shadow-[0_2px_4px_rgba(0,40,112,0.1)]"
          >
            <BrandLogo size="nav" />
          </Link>

          <div className="flex min-w-0 flex-col items-end justify-center gap-1">
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
              <PrimaryNavLinks />
              <AdminTools />
              <AuthLinks onLogout={logout} />
              <RoleMenus />
            </div>
            {!user ? (
              <YearToggle tone="light" />
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                <UserSummary className="max-w-[14rem] text-right" />
                <YearToggle tone="light" />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
