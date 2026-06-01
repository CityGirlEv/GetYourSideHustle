import { useApp } from "@/lib/app-store";
import { Link, useRouter } from "@tanstack/react-router";
import { SecurityBanner } from "./SecurityBanner";
import { TrustBanner } from "./TrustBanner";
import { CMSFooter } from "./CMSFooter";
import { LogOut, FlaskConical, ChevronDown, LayoutDashboard, ListChecks, Briefcase, Shield, Users, FileSignature, BookOpen, ClipboardList, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditPill } from "./CreditPill";
import { FontSizeToggle } from "./FontSizeToggle";
import { AdminNotificationsBell } from "./AdminNotificationsBell";
import { LoginAlertDialog } from "./LoginAlertDialog";
import { type ReactNode } from "react";
import muntieLogo from "@/assets/muntie-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppShell({ children, title, subtitle, titleClassName }: { children: ReactNode; title: string; subtitle?: string; titleClassName?: string }) {
  const { user, signOut } = useApp();
  const router = useRouter();

  const logout = async () => {
    await signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <LoginAlertDialog />
      <header className="pointer-events-none absolute right-3 top-12 z-30 md:right-6 md:top-14">
        <div className="flex items-center gap-3 flex-none shrink-0 ml-auto z-10 [&>*]:pointer-events-auto">
          <FontSizeToggle />
          {(user?.role === "advisor" || user?.role === "qa") && <CreditPill />}
          {user?.role === "admin" && <AdminNotificationsBell />}
          {user?.role === "admin" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="default" className="gap-1">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Administration</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />Admin Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/users" className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4" />Users & Staff
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tasks" className="flex items-center gap-2 cursor-pointer">
                    <ListChecks className="h-4 w-4" />Task Sheet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/sources" className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="h-4 w-4" />Sources
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>QA</DropdownMenuLabel>
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
                  <Link to="/testing" hash="ip" className="flex items-center gap-2 cursor-pointer">
                    <ClipboardList className="h-4 w-4" />Test Plan / IP
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Compliance</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/nda" className="flex items-center gap-2 cursor-pointer">
                    <FileSignature className="h-4 w-4" />NDA
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user?.role === "qa" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <FlaskConical className="h-4 w-4" />
                  <span className="hidden sm:inline">QA</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
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
                  <Link to="/nda" className="flex items-center gap-2 cursor-pointer">
                    <FileSignature className="h-4 w-4" />NDA
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user?.role === "agent" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Agent</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link to="/agent" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />Agent Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/agent" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />My Scenarios
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/nda" className="flex items-center gap-2 cursor-pointer">
                    <FileSignature className="h-4 w-4" />Agent NDA
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative flex items-center mb-0 mt-2">
          <Link to="/" aria-label="The Medicare Optimizer" className="absolute left-0 top-1/2 -translate-y-1/2 shrink-0">
            <img src={muntieLogo} alt="The Medicare Optimizer" className="h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 object-contain" />
          </Link>
          <div className="mx-auto text-center font-display font-bold px-12 sm:px-16 md:px-20">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary uppercase leading-none">The Medicare Optimizer</h1>
            <p className="text-xs sm:text-sm md:text-base text-primary/80 font-medium italic leading-tight mt-0.5">Let The Optimizer Find The Medicare Plan You Deserve!</p>
          </div>
        </div>
      </div>
      <TrustBanner />
      <main className="flex-1 px-4 md:px-8 pt-0 pb-6 max-w-7xl w-full mx-auto">
        {(title || subtitle) && (
          <div className="mb-2 mt-0.5">
            {title && <h2 className={`font-display font-bold text-2xl md:text-3xl ${titleClassName ?? "text-primary"}`}>{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
