import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — send users straight to the report page. */
export const Route = createFileRoute("/scenario/estimate-created/$code")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/scenario/estimate/$code",
      params: { code: params.code },
      replace: true,
    });
  },
});
