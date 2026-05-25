import { useApp } from "@/lib/app-store";
import { Link, useRouter } from "@tanstack/react-router";
import { SecurityBanner } from "./SecurityBanner";
import { TrustBanner } from "./TrustBanner";
import { CMSFooter } from "./CMSFooter";
import { LogOut, FlaskConical, ChevronDown, LayoutDashboard, ListChecks, Briefcase, Shield, Users, FileSignature, BookOpen, ClipboardList, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditPill } from "./CreditPill";
import { FontSizeToggle } from "./FontSizeToggle";
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
        <div className="flex-1" />
        <div className="flex items-center gap-3 flex-none shrink-0 ml-auto z-10">
          <FontSizeToggle />
          {user?.role === "advisor" && <CreditPill />}
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
      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col items-center text-center mb-2">
          <Link to="/" className="flex items-center gap-3 font-display font-bold">
            <img src={muntieLogo} alt="The Medicare Optimizer" className="h-10 w-10 sm:h-14 sm:w-14 md:h-20 md:w-20 object-contain flex-shrink-200" />
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary uppercase leading-tight">The Medicare Optimizer</h1>
              <p className="text-xs sm:text-sm md:text-base text-primary/80 font-medium italic">You Deserve The Best Medicare Plan Because You Earned It!</p>
            </div>
          </Link>
        </div>
        <TrustBanner />
        {(title || subtitle) && (
          <div className="mb-6 mt-4">
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
