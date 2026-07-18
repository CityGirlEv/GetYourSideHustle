import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { SubmissionChecklist } from "@/components/SubmissionChecklist";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin_/submission-checklist")({
  head: () => ({
    meta: [
      { title: "CMS & Facebook Compliance Checklist — Admin" },
      {
        name: "description",
        content:
          "Facebook ad and CMS Medicare compliance checklist for launching the Part B Optimizer Benchmark Tool.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SubmissionChecklistPage,
});

function SubmissionChecklistPage() {
  return (
    <AdminAccessGate>
      <AppShell
        title="Compliance checklist"
        subtitle="CMS reference, compliance checklist with site-verified items, submission tasks with due dates, and gap tracking."
      >
        <div className="max-w-4xl mx-auto space-y-4 px-2 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
            <Link to="/admin/meta">
              <Button variant="outline" size="sm">
                <ClipboardCheck className="h-4 w-4 mr-1" />
                Meta ads
              </Button>
            </Link>
          </div>
          <SubmissionChecklist />
        </div>
      </AppShell>
    </AdminAccessGate>
  );
}
