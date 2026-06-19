import type { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shield } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Restricts admin-only pages to users with the admin or Leads Admin role.
 * Unauthenticated users are sent to sign-in; others see an access message.
 */
export function AdminAccessGate({ children }: { children: ReactNode }) {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const isAdmin = userHasAdminRole(user);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth", search: { tab: "sign-in" } });
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  if (!isAdmin) {
    return (
      <AppShell
        title="Admin access required"
        subtitle="This page is only available to administrator accounts."
      >
        <Card className="glass max-w-lg mx-auto p-6 space-y-4 border-primary/15">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5 shrink-0" />
            <h2 className="font-display text-base font-bold">Administrator sign-in required</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Admin menu, Content Calendar, Content Factory, and other publishing tools are
            restricted to accounts with the <strong className="text-foreground">admin</strong> or{" "}
            <strong className="text-foreground">Leads Admin</strong> role. You are signed in as{" "}
            <strong className="text-foreground capitalize">{user.role ?? "a member"}</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            If you need editorial access, ask an administrator to grant the admin role on your
            account. Learning Center articles are public at{" "}
            <Link to="/learning-center" className="text-primary font-medium hover:text-primary/80 underline-offset-2 hover:underline">
              /learning-center
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild size="sm" className="grad-indigo">
              <Link to="/auth" search={{ tab: "sign-in" }}>
                Switch account
              </Link>
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  return children;
}
