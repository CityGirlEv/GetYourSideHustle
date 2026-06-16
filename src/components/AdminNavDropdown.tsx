import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  DollarSign,
  FileSignature,
  FlaskConical,
  LayoutDashboard,
  ListChecks,
  Mail,
  Shield,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminNavDropdownProps = {
  variant?: "banner" | "button";
};

export function AdminNavDropdown({ variant = "button" }: AdminNavDropdownProps) {
  const trigger =
    variant === "banner" ? (
      <button
        type="button"
        className="flex items-center gap-1.5 text-primary font-semibold underline-offset-4 transition-colors hover:text-primary/65 hover:underline outline-none"
      >
        <Shield className="h-4 w-4" /> Admin <ChevronDown className="h-3 w-3" />
      </button>
    ) : (
      <button
        type="button"
        className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Admin</span>
        <ChevronDown className="h-3 w-3" />
      </button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 text-xs">
        <DropdownMenuLabel>Administration</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            Admin Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer text-xs">
            <Users className="h-4 w-4" />
            Staff
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="text-xs">
            <DropdownMenuItem asChild>
              <Link to="/staff" className="flex items-center gap-2 cursor-pointer">
                Staff roster
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/staff/report" className="flex items-center gap-2 cursor-pointer">
                Device report
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <Link to="/tasks" className="flex items-center gap-2 cursor-pointer">
            <ListChecks className="h-4 w-4" />
            Task Sheet
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/sources" className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-4 w-4" />
            Sources
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/email-templates" className="flex items-center gap-2 cursor-pointer">
            <Mail className="h-4 w-4" />
            Email Templates
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/pricing" className="flex items-center gap-2 cursor-pointer">
            <DollarSign className="h-4 w-4" />
            Lead Pricing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>QA</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/qa" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            QA Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/testing" className="flex items-center gap-2 cursor-pointer">
            <FlaskConical className="h-4 w-4" />
            Testing Portal
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/testing" hash="ip" className="flex items-center gap-2 cursor-pointer">
            <ClipboardList className="h-4 w-4" />
            Test Plan / IP
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Compliance</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/nda" className="flex items-center gap-2 cursor-pointer">
            <FileSignature className="h-4 w-4" />
            NDA
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
