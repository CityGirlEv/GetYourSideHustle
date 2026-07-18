import { createFileRoute } from "@tanstack/react-router";
import { ProjectBudgetPage } from "@/components/ProjectBudgetPage";

export const Route = createFileRoute("/admin_/budget")({
  head: () => ({
    meta: [
      { title: "Project Budget — Admin" },
      {
        name: "description",
        content: "Editable project budget for Part B Optimizer tools, services, and development time.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProjectBudgetPage,
});
