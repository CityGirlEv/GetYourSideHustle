import { Link } from "@tanstack/react-router";
import { ChevronDown, Shield } from "lucide-react";
import {
  ADMIN_CONTENT_GROUP,
  ADMIN_DASHBOARD_LINK,
  ADMIN_OPERATION_LINKS,
  ADMIN_QA_GROUP,
  ADMIN_REFERENCE_LINKS,
  ADMIN_STAFF_GROUP,
  type AdminNavGroup,
  type AdminNavLink,
} from "@/lib/admin-nav-config";
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
import { cn } from "@/lib/utils";

type AdminNavDropdownProps = {
  variant?: "banner" | "button";
};

function AdminNavLinkItem({ link }: { link: AdminNavLink }) {
  const Icon = link.icon;
  return (
    <DropdownMenuItem asChild>
      <Link
        to={link.to}
        hash={link.hash}
        search={link.search}
        className="flex items-center gap-2 cursor-pointer"
      >
        <Icon className="h-4 w-4 shrink-0" />
        {link.label}
      </Link>
    </DropdownMenuItem>
  );
}

function AdminNavSubMenu({ group }: { group: AdminNavGroup }) {
  const GroupIcon = group.icon;
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className={cn(
          "flex items-center gap-2 cursor-pointer text-xs",
          group.highlight &&
            "font-semibold text-amber-700 dark:text-amber-300 data-[state=open]:bg-amber-500/10",
        )}
      >
        <GroupIcon
          className={cn("h-4 w-4 shrink-0", group.highlight && "text-amber-600 dark:text-amber-400")}
        />
        {group.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56 text-xs">
        {group.items.map((link) => (
          <AdminNavLinkItem key={`${link.to}-${link.hash ?? link.label}`} link={link} />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function AdminNavDropdown({ variant = "button" }: AdminNavDropdownProps) {
  const trigger =
    variant === "banner" ? (
      <button
        type="button"
        className="inline-flex items-center justify-center gap-1 min-h-11 min-w-11 xl:min-w-0 xl:px-0 xl:gap-1.5 text-primary font-semibold underline-offset-4 transition-colors hover:text-primary/65 hover:underline outline-none touch-manipulation"
        aria-label="Admin menu"
      >
        <Shield className="h-4 w-4 shrink-0" />
        <span className="hidden xl:inline">Admin</span>
        <ChevronDown className="h-3 w-3 hidden xl:inline" />
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
      <DropdownMenuContent align="end" className="w-64 text-xs">
        <DropdownMenuLabel>Administration</DropdownMenuLabel>
        <AdminNavLinkItem link={ADMIN_DASHBOARD_LINK} />

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-muted-foreground">
          Publishing
        </DropdownMenuLabel>
        <AdminNavSubMenu group={ADMIN_CONTENT_GROUP} />

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
          QA &amp; Testing
        </DropdownMenuLabel>
        <AdminNavSubMenu group={ADMIN_QA_GROUP} />

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-muted-foreground">
          Operations
        </DropdownMenuLabel>
        {ADMIN_OPERATION_LINKS.map((link) => (
          <AdminNavLinkItem key={link.to} link={link} />
        ))}

        <DropdownMenuSeparator />
        <AdminNavSubMenu group={ADMIN_STAFF_GROUP} />

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] text-muted-foreground">
          Reference
        </DropdownMenuLabel>
        {ADMIN_REFERENCE_LINKS.map((link) => (
          <AdminNavLinkItem key={link.to} link={link} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
