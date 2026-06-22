import { ClientOnly, createFileRoute, useRouter } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";

const UsersManagement = lazy(() =>
  import("@/components/UsersManagement").then((m) => ({ default: m.UsersManagement })),
);

/** Canonical admin user roster at /staff. */
export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [{ title: "Users — Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: StaffPage,
});

function StaffLoading() {
  return (
    <AppShell title="Users" subtitle="Loading users…">
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </AppShell>
  );
}

function StaffPage() {
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
    <ClientOnly fallback={<StaffLoading />}>
      <Suspense fallback={<StaffLoading />}>
        <UsersManagement />
      </Suspense>
    </ClientOnly>
  );
}
