import { useState, type ComponentType, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  FileSignature,
  FlaskConical,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
} from "lucide-react";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import { ADMIN_MOBILE_SECTIONS } from "@/lib/admin-nav-config";
import { AdminNotificationsBell } from "@/components/AdminNotificationsBell";
import { BrandLogo } from "@/components/BrandLogo";
import { CreditPill } from "@/components/CreditPill";
import { FontSizeToggle } from "@/components/FontSizeToggle";
import { YearToggle } from "@/components/YearToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const mobileNavItem =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70 active:bg-muted";

function MobileNavLink({
  to,
  search,
  hash,
  icon: Icon,
  label,
  onNavigate,
  className,
}: {
  to: string;
  search?: Record<string, string>;
  hash?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      hash={hash}
      className={cn(mobileNavItem, className)}
      onClick={onNavigate}
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      {label}
    </Link>
  );
}

function MobileNavSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-1", className)}>
      <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

export function SiteMobileNav({ onLogout }: { onLogout: () => void | Promise<void> }) {
  const { user, authLoading } = useApp();
  const [open, setOpen] = useState(false);
  const isAdmin = userHasAdminRole(user);
  const close = () => setOpen(false);

  return (
    <>
      <div className="lg:hidden flex items-center justify-between gap-2 py-1">
        <Link
          to="/"
          aria-label="Part B Optimizer home"
          className="block shrink-0 drop-shadow-[0_2px_4px_rgba(0,40,112,0.1)]"
          onClick={close}
        >
          <BrandLogo size="navMobile" className="w-[4.75rem] sm:w-[5.25rem]" />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {!authLoading && isAdmin ? <AdminNotificationsBell tone="light" /> : null}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[min(100vw-1rem,20rem)] p-0 sm:max-w-xs">
          <SheetHeader className="border-b border-border px-4 py-4 text-left space-y-3">
            <SheetTitle className="sr-only">Site menu</SheetTitle>
            <BrandLogo size="navMobile" className="w-[5.25rem]" />
            {user ? (
              <div className="min-w-0 text-left text-xs leading-tight">
                <div className="truncate font-medium text-foreground">{user.full_name}</div>
                <div className="truncate capitalize text-muted-foreground">
                  {user.role}
                  {user.npn_number ? ` · NPN ${user.npn_number}` : ""}
                </div>
              </div>
            ) : null}
          </SheetHeader>

          <div className="flex max-h-[calc(100vh-8rem)] flex-col gap-5 overflow-y-auto px-3 py-4">
            <MobileNavSection title="Explore">
              <MobileNavLink to="/" icon={Home} label="Home" onNavigate={close} />
              {!authLoading && isAdmin ? (
                <MobileNavLink to="/pricing" icon={Briefcase} label="Pricing" onNavigate={close} />
              ) : null}
              <MobileNavLink
                to="/learning-center"
                icon={BookOpen}
                label="Learning Center"
                onNavigate={close}
              />
              <MobileNavLink to="/about" icon={Info} label="About" onNavigate={close} />
            </MobileNavSection>

            <MobileNavSection title="Account">
              {user ? (
                <button
                  type="button"
                  className={mobileNavItem}
                  onClick={() => {
                    close();
                    void onLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 shrink-0 text-primary" />
                  Log out
                </button>
              ) : (
                <>
                  <MobileNavLink
                    to="/auth"
                    search={{ tab: "sign-in" }}
                    icon={LogIn}
                    label="Log in"
                    onNavigate={close}
                  />
                  <MobileNavLink
                    to="/auth"
                    search={{ tab: "register" }}
                    icon={UserPlus}
                    label="Register"
                    onNavigate={close}
                  />
                </>
              )}
            </MobileNavSection>

            {(user?.role === "agent" || user?.role === "customer") && (
              <MobileNavSection title="Agent">
                <MobileNavLink
                  to="/agent"
                  icon={LayoutDashboard}
                  label="Agent portal"
                  onNavigate={close}
                />
                <MobileNavLink to="/nda" icon={FileSignature} label="Agent NDA" onNavigate={close} />
              </MobileNavSection>
            )}

            {user?.role === "qa" && (
              <MobileNavSection title="QA">
                <MobileNavLink
                  to="/testing"
                  icon={FlaskConical}
                  label="Testing portal"
                  onNavigate={close}
                />
                {isAdmin ? (
                  <MobileNavLink
                    to="/admin/email-templates"
                    icon={FileText}
                    label="Email templates"
                    onNavigate={close}
                  />
                ) : null}
                <MobileNavLink to="/nda" icon={FileSignature} label="NDA" onNavigate={close} />
              </MobileNavSection>
            )}

            {isAdmin ? (
              <>
                {ADMIN_MOBILE_SECTIONS.map((section) => {
                  if (section.type === "link") {
                    const { link } = section;
                    const Icon = link.icon;
                    return (
                      <MobileNavSection key={link.to} title="Admin">
                        <MobileNavLink
                          to={link.to}
                          hash={link.hash}
                          search={link.search}
                          icon={Icon}
                          label={link.label}
                          onNavigate={close}
                        />
                      </MobileNavSection>
                    );
                  }

                  if (section.type === "group") {
                    const { group } = section;
                    return (
                      <MobileNavSection
                        key={group.id}
                        title={group.label}
                        className={
                          group.highlight
                            ? "rounded-lg border border-amber-500/25 bg-amber-500/5 px-1 py-2"
                            : undefined
                        }
                      >
                        {group.items.map((link) => (
                          <MobileNavLink
                            key={`${link.to}-${link.hash ?? link.label}`}
                            to={link.to}
                            hash={link.hash}
                            search={link.search}
                            icon={link.icon}
                            label={link.label}
                            onNavigate={close}
                            className={
                              group.highlight ? "text-amber-950 dark:text-amber-100" : undefined
                            }
                          />
                        ))}
                      </MobileNavSection>
                    );
                  }

                  return (
                    <MobileNavSection key={section.title} title={section.title}>
                      {section.links.map((link) => (
                        <MobileNavLink
                          key={link.to}
                          to={link.to}
                          hash={link.hash}
                          search={link.search}
                          icon={link.icon}
                          label={link.label}
                          onNavigate={close}
                        />
                      ))}
                    </MobileNavSection>
                  );
                })}
              </>
            ) : null}

            <MobileNavSection title="Preferences">
              <div className="flex flex-wrap items-center gap-2 px-3 py-1">
                <YearToggle tone="light" />
                <FontSizeToggle />
                {(user?.role === "advisor" || user?.role === "qa") && <CreditPill />}
              </div>
            </MobileNavSection>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
