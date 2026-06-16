import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — staff management lives at /staff. */
export const Route = createFileRoute("/admin_/users")({
  beforeLoad: () => {
    throw redirect({ to: "/staff", replace: true });
  },
  component: () => null,
});
