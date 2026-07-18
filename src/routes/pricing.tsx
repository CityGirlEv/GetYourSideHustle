import { createFileRoute, redirect } from "@tanstack/react-router";
import { pricingRedirectSearch } from "@/lib/features-pricing-tabs";

export const Route = createFileRoute("/pricing")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    checkout: typeof search.checkout === "string" ? search.checkout : undefined,
  }),
  beforeLoad: ({ search }) => {
    const { tab } = pricingRedirectSearch(search.tab);
    throw redirect({
      to: "/features",
      search: {
        tab,
        ...(search.checkout ? { checkout: search.checkout } : {}),
      },
      hash: "agent-pricing",
      replace: true,
    });
  },
});
