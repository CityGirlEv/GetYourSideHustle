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
  Mail,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { SiteNavLink } from "./SiteNavLink";
import { PlanYearZoomControls } from "./PlanYearZoomControls";
import { AdminNotificationsBell } from "./AdminNotificationsBell";
import { AdminNavDropdown } from "./AdminNavDropdown";
import { BrandLogo } from "./BrandLogo";
import { SiteMobileNav } from "./SiteMobileNav";
import { useAdminNavAccess } from "@/lib/admin-nav-access";
import { userHasAdminRole } from "@/lib/user-roles";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { CreditPill } from "./CreditPill";
import { Button } from "@/components/ui/button";
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
  return (
    <>
      <SiteNavLink to="/" className={navLink}>
        <Home className="h-4 w-4 shrink-0" /> Home
      </SiteNavLink>
      <SiteNavLink to="/features" className={navLink}>
        <Sparkles className="h-4 w-4 shrink-0" /> Features
      </SiteNavLink>
      <SiteNavLink to="/learning-center" className={navLink}>
        <BookOpen className="h-4 w-4 shrink-0" /> Learning Center
      </SiteNavLink>
      <SiteNavLink to="/subscribe" className={navLink}>
        <Mail className="h-4 w-4 shrink-0" /> Subscribe
      </SiteNavLink>
      <SiteNavLink to="/about" className={navLink}>
        About
      </SiteNavLink>
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
      <SiteNavLink to="/auth" search={{ tab: "sign-in" }} className={navLink}>
        <LogIn className="h-4 w-4 shrink-0" /> Log in
      </SiteNavLink>
      <SiteNavLink to="/auth" search={{ tab: "register" }} className={navLink}>
        <UserPlus className="h-4 w-4 shrink-0" /> Register
      </SiteNavLink>
    </>
  );
}

function UserSummary({ className }: { className?: string }) {
  const { user } = useApp();
  if (!user) return null;

  const roleLabel = [
    user.role,
    user.npn_number ? `NPN ${user.npn_number}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn("min-w-0 max-w-[14rem] truncate text-xs leading-none", className)}
      title={`${user.full_name} · ${roleLabel}`}
    >
      <span className="font-medium text-foreground">{user.full_name}</span>
      <span className="text-muted-foreground">
        {" · "}
        <span className="capitalize">{roleLabel}</span>
      </span>
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
                <FileText className="h-4 w-4" /> My Comparisons
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
      {(user?.role === "advisor" || user?.role === "qa") && <CreditPill />}
    </>
  );
}

function AdminTools() {
  const { showAdminNav, authLoading } = useAdminNavAccess();

  if (authLoading || !showAdminNav) return null;

  return (
    <>
      <AdminNotificationsBell tone="light" />
      <AdminNavDropdown variant="banner" />
    </>
  );
}

export function SecurityBanner() {
  const { signOut } = useApp();

  const logout = async () => {
    await signOut();
    window.location.assign("/auth");
  };

  return (
    <nav
      aria-label="Site navigation"
      className="relative z-20 border-b-0 bg-transparent px-3 sm:px-4 py-1 text-sm"
    >
      <div className="max-w-7xl mx-auto">
        <SiteMobileNav onLogout={logout} />

        <div className="hidden lg:flex items-center justify-between gap-x-6 gap-y-2 py-0.5">
          <SiteNavLink to="/" aria-label={SITE_BRAND_NAME} className="block shrink-0">
            <BrandLogo size="nav" />
          </SiteNavLink>

          <div className="relative z-10 flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
            <PrimaryNavLinks />
            <AdminTools />
            <span className="mx-1 hidden h-5 w-px shrink-0 bg-border/80 xl:inline" aria-hidden />
            <UserSummary className="shrink-0" />
            <AuthLinks onLogout={logout} />
            <RoleMenus />
            <PlanYearZoomControls tone="light" className="shrink-0" />
          </div>
        </div>
      </div>
    </nav>
  );
}
