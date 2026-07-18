import { createFileRoute, redirect } from "@tanstack/react-router";
import type { EditorialMilestone } from "@/lib/content-factory/weekly-editorial-schedule";

/** Legacy URL — paid ads live on /admin/meta. */
export const Route = createFileRoute("/admin_/facebook-ads")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { campaign?: string; milestone?: EditorialMilestone } => ({
    campaign: typeof search.campaign === "string" ? search.campaign : undefined,
    milestone:
      search.milestone === "produce" || search.milestone === "launch"
        ? search.milestone
        : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/admin/meta", search, replace: true });
  },
});
