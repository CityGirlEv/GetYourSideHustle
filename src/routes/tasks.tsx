import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TaskSheetContent } from "@/components/TaskSheet";

import { useApp } from "@/lib/app-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, FlaskConical } from "lucide-react";

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
  const isAdmin = user?.role === "admin";
  const isQa = user?.role === "qa";
  if (!isAdmin) {
    return (
      <AppShell title="Task Sheet" subtitle="Admin only." titleClassName="text-accent-foreground bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
        <p className="text-sm text-muted-foreground">You don't have access to the task sheet. Please contact an administrator.</p>
      </AppShell>
    );
  }
  return (
    <AppShell
      title="Task Sheet"
      subtitle="Spreadsheet-style task tracker for The Medicare Optimizer team."
      titleClassName="bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
    >
      {(isQa || isAdmin) && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <div>
            <b>New here?</b> Read the QA Manual — filters, statuses, bulk edits, and the bug pipeline in one short page.
          </div>
          <a href="/qa-manual" className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            Open QA Manual →
          </a>
        </div>
      )}
      <Tabs defaultValue="tasks" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList className="grid w-full md:w-auto grid-cols-1">
            <TabsTrigger value="tasks"><ListChecks className="h-3.5 w-3.5 mr-1.5" />Task Sheet</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Link
              to="/testing"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Testing Portal →
            </Link>
            
          </div>
        </div>
        <TabsContent value="tasks">
          <TaskSheetContent />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
