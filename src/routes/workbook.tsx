import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { LeadMagnetEmailCapture } from "@/components/LeadMagnetEmailCapture";
import { NewsletterSignupForm } from "@/components/NewsletterSignupForm";
import {
  WorkbookChecklistForm,
  WorkbookDownloadButton,
} from "@/components/WorkbookChecklistForm";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";
import {
  DEFAULT_WORKBOOK_SLUG,
  WORKBOOK_DISPLAY_TITLE,
  WORKBOOK_FACEBOOK_ARTICLE_SLUG,
} from "@/lib/content-factory/lead-magnet-paths";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";
import { BookOpen, Download } from "lucide-react";

const PAGE_URL = canonicalUrl("/workbook");

export const Route = createFileRoute("/workbook")({
  head: () => ({
    meta: [
      { title: `${WORKBOOK_DISPLAY_TITLE} — ${SITE_BRAND_NAME}` },
      {
        name: "description",
        content:
          "Download the Part B Optimizer (PBO) Turning 65 Workbook — a printable checklist for prescriptions, doctors, and enrollment questions. Educational only.",
      },
      { property: "og:title", content: `${WORKBOOK_DISPLAY_TITLE} — ${SITE_BRAND_NAME}` },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: WorkbookLandingPage,
});

function WorkbookLandingPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Download className="h-3.5 w-3.5" />
            Free educational PDF
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {WORKBOOK_DISPLAY_TITLE}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {DEFAULT_WORKBOOK_LEAD_MAGNET.excerpt} Gather prescriptions, doctors, employer coverage
            notes, and questions before you compare plans — educational only, not enrollment advice.
          </p>
          <WorkbookDownloadButton className="w-full sm:w-auto" size="default" />
        </div>

        <Card className="glass p-5 sm:p-6 space-y-4 border-primary/15">
          <h2 className="font-display font-bold text-lg">Interactive checklist</h2>
          <p className="text-sm text-muted-foreground">
            Check off items and fill in notes below. Your progress saves in this browser, and you can
            download a PDF copy of your answers anytime.
          </p>
          <WorkbookChecklistForm />
        </Card>

        <Card className="glass p-5 sm:p-6 space-y-4 border-primary/15">
          <h2 className="font-display font-bold text-lg">Get the PDF by email</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email and we will send a download link. You can also open the PDF immediately
            after submitting.
          </p>
          <LeadMagnetEmailCapture
            slug={DEFAULT_WORKBOOK_SLUG}
            workbookTitle={DEFAULT_WORKBOOK_LEAD_MAGNET.title}
          />
        </Card>

        <Card className="glass p-5 space-y-3 border-border/60">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-display font-bold">Pairs with our Still Working guide</h3>
              <p className="text-sm text-muted-foreground">
                Read the Learning Center article on employer coverage vs. Medicare, then use this
                workbook to organize your facts.
              </p>
              <Link
                to="/learning-center/$slug"
                params={{ slug: WORKBOOK_FACEBOOK_ARTICLE_SLUG }}
                className="text-sm text-primary hover:underline underline-offset-2"
              >
                Read: Turning 65 and still working →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="glass p-5 space-y-3 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="font-display font-bold text-lg">Weekly Learning Center emails</h3>
          <p className="text-sm text-muted-foreground">
            Prefer tips in your inbox each week? Subscribe separately from the workbook download.
          </p>
          <NewsletterSignupForm />
        </Card>
      </div>
    </AppShell>
  );
}
