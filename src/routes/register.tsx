import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", search: { tab: "register" } });
  },
  head: () => ({
    meta: [{ title: "Register — Part B Optimizer" }],
    links: [{ rel: "canonical", href: "https://themedicareoptimizer.lovable.app/auth" }],
  }),
  component: () => null,
});
