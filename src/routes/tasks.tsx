import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TaskSheetContent } from "@/components/TaskSheet";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Sheet — The Medicare Optimizer" },
      { name: "description", content: "Spreadsheet-style task tracker for The Medicare Optimizer team." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TaskSheetPage,
});

function TaskSheetPage() {
  return (
    <AppShell title="Task Sheet" subtitle="Spreadsheet-style task tracker — inline edits autosave to this browser.">
      <TaskSheetContent />
    </AppShell>
  );
}
