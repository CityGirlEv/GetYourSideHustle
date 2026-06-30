import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ScoutingDashboard } from "@/components/ScoutingDashboard";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";

export const Route = createFileRoute("/admin_/competitor-scouting")({
  head: () => ({
    meta: [
      { title: "Competitor Scouting — Admin" },
      {
        name: "description",
        content: "Medicare competitor ad scouting for admin research.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminCompetitorScoutingPage,
});

function AdminCompetitorScoutingPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }
    if (!userHasAdminRole(user)) {
      router.navigate({ to: "/" });
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  return (
    <AppShell
      title="Competitor Scouting"
      subtitle="Medicare ads and landing pages from Facebook, TikTok, and web search"
    >
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Admin-only — competitive research, not a lead log
          </div>
          <Link to="/admin">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        <ScoutingDashboard />
      </div>
    </AppShell>
  );
}
