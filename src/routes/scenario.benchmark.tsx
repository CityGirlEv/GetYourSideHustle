import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/scenario/benchmark")({
  beforeLoad: () => {
    throw redirect({ to: "/scenario/new", replace: true });
  },
});
