import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import { StaffReport } from "@/components/StaffReport";

export const Route = createFileRoute("/staff_/report")({
  head: () => ({
    meta: [
      { title: "Staff device report — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StaffReportPage,
});

function StaffReportPage() {
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

  return <StaffReport />;
}
