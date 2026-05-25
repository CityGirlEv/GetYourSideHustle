import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TaskSheetContent } from "@/components/TaskSheet";
import { useApp } from "@/lib/app-store";

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
  const { user } = useApp();
  if (user?.role !== "admin") {
    return (
      <AppShell title="Task Sheet" subtitle="Admin only.">
        <p className="text-sm text-muted-foreground">You don't have access to the task sheet. Please contact an administrator.</p>
      </AppShell>
    );
  }
  return (
    <AppShell title="Task Sheet" subtitle="Spreadsheet-style task tracker — inline edits autosave to this browser.">
      <TaskSheetContent />
    </AppShell>
  );
}
