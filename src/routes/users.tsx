import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — staff management lives at /staff. */
export const Route = createFileRoute("/users")({
  beforeLoad: () => {
    throw redirect({ to: "/staff", replace: true });
  },
  component: () => null,
});
